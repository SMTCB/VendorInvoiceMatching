
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log('--- DATA FIX START ---');

    // 1. Delete the "invalid" PO that keeps passing S11
    const { error: e1 } = await supabase.from('ekpo').delete().eq('po_number', '9999999999');
    const { error: e2 } = await supabase.from('ekko').delete().eq('po_number', '9999999999');
    if (e1 || e2) console.error('Error deleting 9999999999:', e1 || e2);
    else console.log('S11 PO (9999999999) deleted successfully.');

    // 2. Clear old matching results to avoid confusion
    const { error: e3 } = await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000' as any);
    if (e3) console.error('Error clearing invoices:', e3);
    else console.log('Invoice results cleared.');

    console.log('--- DATA FIX END ---');
}

run();
