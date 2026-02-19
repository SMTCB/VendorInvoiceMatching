
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log('--- DB PEEK START ---');
    const { data: ekko, error: err1 } = await supabase.from('ekko').select('po_number');
    const { data: ekpo, error: err2 } = await supabase.from('ekpo').select('po_number');

    if (err1) console.error('EKKO error:', err1);
    if (err2) console.error('EKPO error:', err2);

    console.log('PO Numbers in EKKO:', ekko?.map(d => d.po_number));
    console.log('PO Numbers in EKPO:', ekpo?.map(d => d.po_number));
    console.log('--- DB PEEK END ---');
}

run();
