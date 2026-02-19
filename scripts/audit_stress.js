
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function audit() {
    console.log('--- FINAL STRESS TEST AUDIT ---');
    const { data, error } = await s.from('invoices').select('invoice_number, status, exception_reason, audit_trail').ilike('invoice_number', 'STRESS-%').order('invoice_number', { ascending: true });

    if (error) {
        console.error('Audit Error:', error);
        return;
    }

    const expected = {
        'STRESS-C2-001': 'READY_TO_POST',
        'STRESS-C2-002': 'BLOCKED_PRICE',
        'STRESS-C2-003': 'BLOCKED_QTY',
        'STRESS-C3-001-1': 'READY_TO_POST',
        'STRESS-C3-001-2': 'AWAITING_INFO',
        'STRESS-C4-001': 'READY_TO_POST',
        'STRESS-C5-001': 'BLOCKED_PRICE',
        'STRESS-C7-001': 'READY_TO_POST'
    };

    console.log('Invoice | Status | Match? | Reason/Audit');
    console.log('---------------------------------------');

    data.forEach(i => {
        const exp = expected[i.invoice_number] || 'UNKNOWN';
        const match = i.status === exp ? '✅' : '❌';
        console.log(`${i.invoice_number} | ${i.status} | ${match} | ${i.exception_reason || i.audit_trail}`);
    });

    console.log('\nTotal Count:', data.length);
}

audit();
