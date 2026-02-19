
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check(id: string) {
    const { data } = await supabase.from('invoices').select('invoice_number, status, audit_trail, po_reference').eq('invoice_number', id).single();
    console.log(`--- ${id} ---`);
    console.log('PO Ref:', data?.po_reference);
    console.log('Status:', data?.status);
    try {
        const audit = JSON.parse(data?.audit_trail || '{}');
        console.log('Audit Trail:', JSON.stringify(audit, null, 2));
    } catch {
        console.log('Audit Trail:', data?.audit_trail);
    }
}

const target = process.argv[2] || 'INV-S1';
check(target);
