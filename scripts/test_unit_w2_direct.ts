
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MOCK_FILE_ID = 'mock_file_id_123';
const WEBHOOK_URL = 'http://localhost:5678/webhook/test-matching';

async function runUnitTest() {
    console.log('--- STARTING UNIT TEST FOR WORKFLOW 2 ---');

    // 1. Reset/Create Mock Record
    console.log(`1. Resetting mock record for ${MOCK_FILE_ID}...`);
    await supabase.from('invoices').delete().eq('google_file_id', MOCK_FILE_ID);

    const { error: insertError } = await supabase.from('invoices').insert({
        invoice_number: 'UNIT-TEST-001',
        google_file_id: MOCK_FILE_ID,
        vendor_name_extracted: 'TechSupply Inc',
        total_amount: 1250.00,
        currency: 'USD',
        status: 'PROCESSING', // Initial status
        // text_content: 'INVOICE #UNIT-TEST-001...' // Column does not exist in DB schema, omitting.
    });

    if (insertError) {
        console.error('Failed to insert mock record:', insertError);
        return;
    }
    console.log('   Mock record created.');

    // 2. Inline Payload (Debugging)
    console.log('2. Preparing payload...');
    const payload = {
        extracted_data: {
            invoice_number: 'UNIT-TEST-001',
            po_reference: 'PO4500001005',
            vendor_name: 'TechSupply Inc',
            total_amount: 1250.00,
            currency: 'USD',
            line_items: [
                { description: 'Laptops', quantity: 10, unit_price: 100.00 },
                { description: 'Printers', quantity: 5, unit_price: 50.00 }
            ],
            text: 'INVOICE #UNIT-TEST-001 PO:4500001005 TechSupply Inc...'
        },
        google_file_id: MOCK_FILE_ID
    };

    // 3. Trigger Webhook
    console.log(`3. Triggering Webhook: ${WEBHOOK_URL}...`);
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('   Webhook triggered successfully.');
        } else {
            console.error(`   Webhook failed: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error('   Response:', text);
            return;
        }

    } catch (err) {
        console.error('   Network error triggering webhook:', err);
        return;
    }

    // 4. Poll for Result
    console.log('4. Polling Supabase for result...');
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 3000)); // Wait 3s

        const { data } = await supabase
            .from('invoices')
            .select('status, exception_reason, audit_trail')
            .eq('google_file_id', MOCK_FILE_ID)
            .single();

        if (data && data.status !== 'PROCESSING') {
            console.log('\n--- TEST RESULT ---');
            console.log(`Status: ${data.status}`);
            console.log(`Reason: ${data.exception_reason}`);
            console.log(`Audit:  ${data.audit_trail}`);
            console.log('-------------------');
            return;
        }
        process.stdout.write('.');
    }

    console.log('\nTimeout: Status remained PROCESSING.');
}

runUnitTest();
