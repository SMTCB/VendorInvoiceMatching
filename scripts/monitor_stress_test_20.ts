// @ts-nocheck

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Webhook for Matching Logic (Test URL or Production if exposed)
// Using local tunnel or direct n8n trigger simulation
const WEBHOOK_URL = 'http://localhost:5678/webhook/test-matching';

async function runStressTestAndValidate() {
    console.log('=== STRESS TEST EXECUTION & MONITORING (20 Scenarios) ===');

    // 1. Load Scenarios
    const scenariosPath = path.resolve(process.cwd(), 'testing/stress_test/scenarios.json');
    const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));

    // 2. Map Scenarios to Expectations
    const expectations: Record<string, string> = {
        'S1_PERFECT_MATCH': 'READY_TO_POST',
        'S2_MULTI_LINE': 'READY_TO_POST',
        'S3_PRICE_BLOCK': 'BLOCKED_PRICE',
        'S4_QTY_BLOCK': 'BLOCKED_QTY',
        'S5_CURRENCY_FAIL': 'BLOCKED_PRICE', // Can be just BLOCKED depending on rule
        'S6_PARTIAL_DELIV': 'READY_TO_POST',
        'S7_FINAL_DELIV': 'AWAITING_INFO',
        'S8_FUZZY_VENDOR': 'READY_TO_POST', // Assuming fuzzy match works
        'S9_AI_LEARNING': 'READY_TO_POST',
        'S10_NO_PO': 'BLOCKED_DATA', // or AWAITING_INFO
        'S11_INVALID_PO': 'BLOCKED_DATA',
        'S12_TOLERANCE_PASS': 'READY_TO_POST', // If tolerance logic exists, else BLOCKED_PRICE
        'S13_SERVICE_PO': 'READY_TO_POST',
        'S14_DUPLICATE': 'BLOCKED_DUPLICATE', // If implemented
        'S15_CREDIT_MEMO': 'READY_TO_POST',
        'S16_FREIGHT': 'BLOCKED_PRICE',
        'S17_TAX_MISMATCH': 'BLOCKED_PRICE',
        'S18_HIGH_VALUE': 'READY_TO_POST',
        'S19_OLD_DATE': 'READY_TO_POST',
        'S20_COMPLEX_AUDIT': 'BLOCKED_PRICE'
    };

    // 3. Trigger & Monitor
    const results = [];

    console.log(`\nProcessing ${scenarios.length} scenarios...`);

    for (const s of scenarios) {
        process.stdout.write(`Triggering ${s.id}... `);

        const invNum = s.invoice_data.number;
        const payload = {
            google_file_id: `gdrive_${s.id}`,
            extracted_data: {
                invoice_number: invNum,
                po_reference: s.po_data?.number || '',
                vendor_name: s.vendor, // Simulate OCR extracted name
                total_amount: s.invoice_data.total,
                currency: s.invoice_data.currency,
                line_items: [s.line_item, ...(s.extra_inv_lines || [])],
                text: s.text_content || `OCR Text for ${s.desc}`
            }
        };

        try {
            // A. Ensure Record Exists (Simulate Ingestion)
            const { error: upsertKey } = await supabase.from('invoices').upsert({
                invoice_number: invNum,
                google_file_id: payload.google_file_id,
                vendor_name_extracted: s.vendor,
                total_amount: s.invoice_data.total,
                currency: s.invoice_data.currency,
                status: 'PROCESSING', // Reset status for test
                audit_trail: 'Simulation Started',
                po_reference: payload.extracted_data.po_reference,
                line_items: JSON.stringify(payload.extracted_data.line_items) // Ensure stringified JSON for safety
            }, { onConflict: 'google_file_id' });

            if (upsertKey) {
                console.log(`❌ Upsert Failed for ${invNum}: ${upsertKey.message}`);
                continue; // Skip webhook if upsert failed
            }

            // B. Trigger Webhook
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('✔ Triggered OK');
            } else {
                console.log(`❌ Webhook Failed (${response.status})`);
            }

        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }

        // Small delay to prevent rate limit on local n8n
        await new Promise(r => setTimeout(r, 500));
    }


    // 4. Polling for Results
    console.log('\nWaiting for processing (Max 90s)...');

    // Check every 3s for up to 90s
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 3000));

        // Count finished
        const { data: pending } = await supabase
            .from('invoices')
            .select('invoice_number')
            .eq('status', 'PROCESSING')
            .in('invoice_number', scenarios.map(s => s.invoice_data.number));

        const pendingCount = pending?.length || 0;
        process.stdout.write(`\r[${i + 1}/15] Pending: ${pendingCount}   `);

        if (pendingCount === 0) break;
    }
    console.log('\n');

    // 5. Validation
    console.log('---------------------------------------------------------------------------------');
    console.log('| ID                 | Invoice      | Expected       | Actual         | Pass? |');
    console.log('---------------------------------------------------------------------------------');

    let passCount = 0;

    for (const s of scenarios) {
        const invNum = s.invoice_data.number;
        const expected = expectations[s.id] || 'READY_TO_POST';

        const { data: rec } = await supabase
            .from('invoices')
            .select('status, exception_reason')
            .eq('invoice_number', invNum)
            .single();

        const actual = rec?.status || 'NOT_FOUND';

        // Fuzzy Status Check (e.g. BLOCKED vs BLOCKED_PRICE)
        const isMatch = actual === expected || (expected.startsWith('BLOCKED') && actual.startsWith('BLOCKED'));

        if (isMatch) passCount++;

        const icon = isMatch ? '✅' : '❌';
        console.log(`| ${s.id.padEnd(18)} | ${invNum.padEnd(12)} | ${expected.padEnd(14)} | ${actual.padEnd(14)} | ${icon}   |`);

        if (!isMatch && rec) {
            console.log(`  > Reason: ${rec.exception_reason}`);
        }
    }
    console.log('---------------------------------------------------------------------------------');
    console.log(`Summary: ${passCount}/${scenarios.length} scenarios passed.`);
}

runStressTestAndValidate().catch(console.error);
