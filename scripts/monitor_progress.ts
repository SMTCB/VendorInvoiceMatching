
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function monitor() {
    console.log('--- MONITORING PROGRESS ---');
    const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number, status, updated_at, google_file_id, audit_trail, exception_reason')
        .order('updated_at', { ascending: false })
        .limit(40);

    if (error) {
        console.error(error);
        return;
    }

    data?.forEach(row => {
        console.log(`[${row.updated_at}] ${row.invoice_number.padEnd(15)} | ${row.status.padEnd(15)} | ${row.google_file_id.padEnd(25)} | ${row.audit_trail || ''} | ${row.exception_reason || ''}`);
    });
}

monitor();
