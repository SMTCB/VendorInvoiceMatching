
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanup() {
    console.log('Cleaning up STRESS-* invoices...');
    const { error } = await s.from('invoices').delete().ilike('invoice_number', 'STRESS-%');
    if (error) console.error(error);
    else console.log('Cleanup successful.');
}

cleanup();
