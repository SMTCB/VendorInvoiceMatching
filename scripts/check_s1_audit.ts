
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data } = await supabase.from('invoices').select('invoice_number, status, audit_trail').eq('invoice_number', 'INV-S1').single();
    console.log('--- S1 Check ---');
    console.log('Status:', data?.status);
    console.log('Audit Trail:', data?.audit_trail);
}

check();
