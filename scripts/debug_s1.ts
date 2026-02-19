
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MOCK_FILE_ID = 'debug_S1_manual';
const WEBHOOK_URL = 'http://localhost:5678/webhook/test-matching';

async function runUnitTest() {
    console.log('--- DEBUGGING S1 (PO 4500002001) ---');

    await supabase.from('invoices').delete().eq('google_file_id', MOCK_FILE_ID);

    const { error: insertError } = await supabase.from('invoices').insert({
        invoice_number: 'DEBUG-S1',
        google_file_id: MOCK_FILE_ID,
        vendor_name_extracted: 'TechGap Solutions',
        total_amount: 100.00,
        currency: 'USD',
        status: 'PROCESSING'
    });

    if (insertError) {
        console.error('Failed to insert mock record:', insertError);
        return;
    }

    const payload = {
        extracted_data: {
            invoice_number: 'DEBUG-S1',
            po_reference: '4500002001',
            vendor_name: 'TechGap Solutions',
            total_amount: 100.00,
            currency: 'USD',
            line_items: [
                { description: 'Standard Widget', quantity: 10, unit_price: 10.00 }
            ],
            text: 'PO: 4500002001'
        },
        google_file_id: MOCK_FILE_ID
    };

    console.log('Triggering Webhook...');
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const respText = await response.text();
        console.log('Webhook Response:', respText);

    } catch (err) {
        console.error('Network error:', err);
        return;
    }

    console.log('Polling for status...');
    for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 4000));
        const { data } = await supabase
            .from('invoices')
            .select('status, exception_reason, audit_trail')
            .eq('google_file_id', MOCK_FILE_ID)
            .single();

        if (data && data.status !== 'PROCESSING') {
            console.log('\n--- RESULT ---');
            console.log(`Status: ${data.status}`);
            console.log(`Reason: ${data.exception_reason}`);
            console.log(`Audit:  ${data.audit_trail}`);
            return;
        }
        process.stdout.write('.');
    }
}

runUnitTest();
