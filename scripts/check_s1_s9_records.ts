
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    const { data: s9 } = await supabase.from('invoices').select('invoice_number, status, po_reference, audit_trail').eq('invoice_number', 'INV-S9').single();
    console.log('S9:', s9);

    const { data: s1 } = await supabase.from('invoices').select('invoice_number, status, po_reference, audit_trail').eq('invoice_number', 'INV-S1').single();
    console.log('S1:', s1);
}

check();
