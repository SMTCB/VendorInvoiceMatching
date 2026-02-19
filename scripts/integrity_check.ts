
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log('--- DB INTEGRITY CHECK ---');

    // Check for S11 PO
    const { data: s11Po } = await supabase.from('ekpo').select('po_number').eq('po_number', '9999999999');
    console.log('S11 PO (9999999999) exists in EKPO:', s11Po && s11Po.length > 0 ? 'YES' : 'NO');

    // Check EKKO for S16 and S17
    const { data: headers } = await supabase.from('ekko').select('*').in('po_number', ['4500002016', '4500002017']);
    console.log('Headers for S16, S17:', JSON.stringify(headers, null, 2));

    // Check if S7 FINAL keyword is being detected by the fetch examples
    const { data: s7Content } = await supabase.from('invoices').select('audit_trail').eq('invoice_number', 'INV-S7').single();
    console.log('S7 Audit Trail:', s7Content?.audit_trail);
}

run();
