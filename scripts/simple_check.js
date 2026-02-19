
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- Current Stress Test Records ---');
    const { data, error } = await s.from('invoices').select('invoice_number, status, google_file_id').ilike('invoice_number', 'STRESS-%').order('created_at', { ascending: false });
    if (error) {
        console.error(error);
        return;
    }
    data.forEach(i => {
        console.log(`${i.invoice_number} | ${i.status} | ${i.google_file_id}`);
    });
    console.log(`Total: ${data.length}`);
}

check();
