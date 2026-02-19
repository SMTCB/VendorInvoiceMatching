
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log('--- S11 DATA PEEK ---');
    const { data: ekko } = await supabase.from('ekko').select('*').eq('po_number', '9999999999');
    const { data: ekpo } = await supabase.from('ekpo').select('*').eq('po_number', '9999999999');
    console.log('EKKO:', ekko);
    console.log('EKPO:', ekpo);
}

run();
