
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function monitorStressTest() {
    console.log('--- Monitoring Stress Test (Invoices starting with STRESS-) ---');
    console.log('Press Ctrl+C to stop.\n');

    const expectedInvoices = [
        'STRESS-C2-001', 'STRESS-C2-002', 'STRESS-C2-003',
        'STRESS-C3-001-1', 'STRESS-C3-001-2', 'STRESS-C4-001',
        'STRESS-C5-001', 'STRESS-C7-001'
    ];

    while (true) {
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('invoice_number, status, exception_reason, confidence')
            .ilike('invoice_number', 'STRESS-%')
            .order('invoice_number', { ascending: true });

        if (error) {
            console.error('Error fetching invoices:', error);
            break;
        }

        // process.stdout.write('\x1Bc'); // Clear console
        console.log('--- STRESS TEST MONITOR ---');
        console.log(`Time: ${new Date().toLocaleTimeString()}\n`);

        const table = invoices?.map(inv => ({
            "Invoice #": inv.invoice_number,
            "Status": inv.status,
            "Confidence": inv.confidence ? `${inv.confidence}%` : '-',
            "Exception": inv.exception_reason || '-'
        }));

        if (table && table.length > 0) {
            console.table(table);

            const finishedCount = invoices.filter(inv => inv.status !== 'PROCESSING').length;
            console.log(`Progress: ${finishedCount} / ${invoices.length} processed.`);

            if (finishedCount === expectedInvoices.length && finishedCount > 0) {
                console.log('\n✅ ALL INVOICES PROCESSED.');
                // break; // Keep running just to be sure
            }
        } else {
            console.log('Waiting for invoices to appear in Supabase...');
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

monitorStressTest().catch(console.error);
