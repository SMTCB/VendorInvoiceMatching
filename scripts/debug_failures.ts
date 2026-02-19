
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkFailures() {
    const ids = ['gdrive_S7_FINAL_DELIV', 'gdrive_S11_INVALID_PO', 'gdrive_S16_FREIGHT', 'gdrive_S19_OLD_DATE'];
    const { data, error } = await supabase
        .from('invoices')
        .select('google_file_id, status, audit_trail, exception_reason')
        .in('google_file_id', ids);

    if (error) {
        console.error(error);
        return;
    }

    data?.forEach(row => {
        console.log(`\nID: ${row.google_file_id}`);
        console.log(`Status: ${row.status}`);
        console.log(`Audit: ${row.audit_trail}`);
        console.log(`Reason: ${row.exception_reason}`);
    });
}

checkFailures();
