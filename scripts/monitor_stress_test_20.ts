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

    // 3. Sequential Execution
    console.log(`\nProcessing ${scenarios.length} scenarios SEQUENTIALLY...`);

    for (const s of scenarios) {
        console.log(`\n[${s.id}] Starting...`);
        console.log(`  PO Ref from Scenario: "${s.po_data?.number}"`);

        const invNum = s.invoice_data.number;
        const payload = {
            google_file_id: `gdrive_${s.id}`,
            extracted_data: {
                invoice_number: invNum,
                po_reference: s.po_data?.number || '',
                vendor_name: s.vendor,
                total_amount: s.invoice_data.total,
                currency: s.invoice_data.currency,
                line_items: s.extra_inv_lines ? [...[s.line_item], ...s.extra_inv_lines] : [s.line_item],
                text: s.text_content || `OCR Text for ${s.desc}`
            }
        };

        try {
            // A. Reset & Upsert
            await supabase.from('invoices').upsert({
                invoice_number: invNum,
                google_file_id: payload.google_file_id,
                vendor_name_extracted: s.vendor,
                total_amount: s.invoice_data.total,
                currency: s.invoice_data.currency,
                status: 'PROCESSING',
                audit_trail: 'Sequential Run Started',
                po_reference: payload.extracted_data.po_reference,
                line_items: JSON.stringify(payload.extracted_data.line_items)
            }, { onConflict: 'google_file_id' });

            // B. Trigger Webhook
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.log(`  ❌ Webhook Failed (${response.status})`);
                continue;
            }

            // C. Poll for completion of THIS specific invoice
            let finished = false;
            let attempts = 0;
            while (!finished && attempts < 40) {
                await new Promise(r => setTimeout(r, 2000));
                const { data: rec } = await supabase
                    .from('invoices')
                    .select('status, exception_reason, audit_trail')
                    .eq('google_file_id', payload.google_file_id)
                    .single();

                if (rec && rec.status !== 'PROCESSING') {
                    finished = true;
                    const expected = expectations[s.id] || 'READY_TO_POST';
                    const actual = rec.status;
                    const isMatch = actual === expected || (expected.startsWith('BLOCKED') && actual.startsWith('BLOCKED'));
                    const icon = isMatch ? '✅' : '❌';

                    console.log(`  Result: ${icon} ${actual} (Expected: ${expected})`);
                    if (!isMatch) {
                        console.log(`  > Reason: ${rec.exception_reason}`);
                        console.log(`  > Audit: ${rec.audit_trail}`);
                    }
                }
                attempts++;
            }

            if (!finished) console.log('  ⏳ Timeout waiting for n8n...');

        } catch (e) {
            console.log(`  ❌ Error: ${e.message}`);
        }
    }
    console.log('\n--- SEQUENTIAL RUN COMPLETE ---');
    console.log('---------------------------------------------------------------------------------');
    console.log(`Summary: ${passCount}/${scenarios.length} scenarios passed.`);
}

runStressTestAndValidate().catch(console.error);
