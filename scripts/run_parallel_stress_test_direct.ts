
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_URL = 'http://localhost:5678/webhook/test-matching';

const SCENARIOS = [
    { id: 'STRESS-C2-001', vendor: 'TechGap Solutions', po: '4500001001', amount: 100.00, currency: 'USD', items: [{ description: 'Tech Consulting', quantity: 1, unit_price: 100.00 }] },
    { id: 'STRESS-C2-002', vendor: 'TechGap Solutions', po: '4500001001', amount: 110.00, currency: 'USD', items: [{ description: 'Tech Consulting', quantity: 1, unit_price: 110.00 }] },
    { id: 'STRESS-C2-003', vendor: 'TechGap Solutions', po: '4500001001', amount: 500.00, currency: 'USD', items: [{ description: 'Tech Consulting', quantity: 5, unit_price: 100.00 }] },
    { id: 'STRESS-C3-001-1', vendor: 'TechGap Solutions', po: '4500001002', amount: 1000.00, currency: 'USD', items: [{ description: 'Raw Materials', quantity: 10, unit_price: 100.00 }] }, // Partial
    { id: 'STRESS-C3-001-2', vendor: 'TechGap Solutions', po: '4500001002', amount: 500.00, currency: 'USD', items: [{ description: 'Raw Materials', quantity: 5, unit_price: 100.00 }], text: "FINAL BILL" }, // Short Final
    { id: 'STRESS-C4-001', vendor: 'TechGap LLC', po: '4500001001', amount: 100.00, currency: 'USD', items: [{ description: 'Tech Consulting', quantity: 1, unit_price: 100.00 }] }, // Fuzzy Vendor
    { id: 'STRESS-C5-001', vendor: 'TechGap Solutions (EUR)', po: '4500001001', amount: 100.00, currency: 'EUR', items: [{ description: 'Tech Consulting', quantity: 1, unit_price: 100.00 }] }, // Currency Mismatch
    // STRESS-C7-001 is duplicate of C2-001 for now, skipping to avoid unique constraint if run immediately? No, unique ID.
    { id: 'STRESS-C7-001', vendor: 'TechGap Solutions', po: '4500001001', amount: 100.00, currency: 'USD', items: [{ description: 'Tech Consulting', quantity: 1, unit_price: 100.00 }] }
];

async function runScenario(scenario: any) {
    const fileId = `mock_${scenario.id}`;
    console.log(`Starting ${scenario.id}...`);

    // 1. Create DB Record
    const { error } = await supabase.from('invoices').upsert({
        invoice_number: scenario.id,
        po_reference: scenario.po,
        vendor_name_extracted: scenario.vendor,
        total_amount: scenario.amount,
        currency: scenario.currency,
        line_items: JSON.stringify(scenario.items),
        google_file_id: fileId,
        status: 'PROCESSING',
        exception_reason: null,
        audit_trail: null
    }, { onConflict: 'google_file_id' });

    if (error) {
        console.error(`Error creating DB record for ${scenario.id}:`, error);
        return;
    }

    // 2. Trigger Webhook
    const payload = {
        extracted_data: {
            invoice_number: scenario.id,
            po_reference: scenario.po,
            vendor_name: scenario.vendor,
            total_amount: scenario.amount,
            currency: scenario.currency,
            line_items: scenario.items,
            text: scenario.text || "-- Generated Text --"
        },
        google_file_id: fileId
    };

    try {
        const res = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) console.error(`Webhook error for ${scenario.id}: ${res.status}`);
    } catch (e) {
        console.error(`Network error for ${scenario.id}:`, e);
    }
}

async function main() {
    console.log('--- STARTING PARALLEL STRESS TEST (DIRECT TRIGGER) ---');

    // Seed POs first just in case
    // (Assuming seed_stress_pos.ts was run separately, but safe to assume database is ready)

    await Promise.all(SCENARIOS.map(s => runScenario(s)));

    console.log('\nAll scenarios triggered. Monitoring results...');
}

main();
