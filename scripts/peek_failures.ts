
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    const ids = [
        'gdrive_S7_FINAL_DELIV',
        'gdrive_S11_INVALID_PO',
        'gdrive_S16_FREIGHT',
        'gdrive_S17_TAX_MISMATCH'
    ];

    const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number, google_file_id, status, audit_trail, exception_reason')
        .in('google_file_id', ids);

    if (error) {
        console.error(error);
        return;
    }

    const fs = require('fs');
    fs.writeFileSync('failure_audit.json', JSON.stringify(data, null, 2));
    console.log('Failure details written to failure_audit.json');
}

run();
