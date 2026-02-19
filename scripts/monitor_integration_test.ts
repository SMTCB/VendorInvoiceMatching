
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function monitorIntegrationTest() {
    console.log('--- MONITORING INTEGRATION TEST ---');
    console.log('Waiting for invoice with amount $1,250.00...');

    let invoiceId: string | null = null;
    const startTime = Date.now();
    const TIMEOUT_MS = 120000; // 2 minutes

    while (Date.now() - startTime < TIMEOUT_MS) {
        // query for the latest invoice with matching amount
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('total_amount', 1250.00)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error querying Supabase:', error);
            await new Promise(r => setTimeout(r, 2000));
            continue;
        }

        if (invoices && invoices.length > 0) {
            const invoice = invoices[0];
            // Check if it's a new one (created in last 5 mins)
            const created = new Date(invoice.created_at).getTime();
            if (Date.now() - created < 300000) {
                if (invoiceId !== invoice.id) {
                    console.log(`\nNew Invoice Detected! ID: ${invoice.id}`);
                    console.log(`File ID: ${invoice.google_file_id}`);
                    invoiceId = invoice.id;
                }

                process.stdout.write(`\rCurrent Status: ${invoice.status}   `);

                if (invoice.status === 'READY_TO_POST') {
                    console.log('\n\nSUCCESS! Invoice is READY_TO_POST.');
                    console.log(`Reason: ${invoice.exception_reason}`);
                    console.log(`Audit: ${invoice.audit_trail}`);
                    return;
                }

                if (invoice.status.includes('BLOCKED') || invoice.status === 'AWAITING_INFO') {
                    console.log(`\n\nFINISHED with status ${invoice.status}.`);
                    console.log(`Reason: ${invoice.exception_reason}`);
                    console.log(`Audit: ${invoice.audit_trail}`);
                    return;
                }
            }
        }

        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\nTimeout waiting for integration test to complete.');
}

monitorIntegrationTest();
