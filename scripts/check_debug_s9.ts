
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    const { data } = await supabase.from('invoices').select('status, audit_trail, po_reference').eq('invoice_number', 'DEBUG-S9').single();
    console.log('Result:', JSON.stringify(data, null, 2));
}

check();
