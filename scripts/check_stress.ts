
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOnce() {
    console.log('--- Checking for Stress Test Invoices (Last 15m) ---');
    const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number, status, exception_reason, audit_trail, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) console.error(error);
    else {
        const stress = data.filter(i => (i.invoice_number || '').startsWith('STRESS-') || new Date(i.created_at) > new Date(Date.now() - 15 * 60 * 1000));
        console.log(JSON.stringify(stress, null, 2));
    }
}

checkOnce().catch(console.error);
