
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    const po = '4500002001';
    const { data: item } = await supabase.from('ekpo').select('*').eq('po_number', po);
    const { data: header } = await supabase.from('ekko').select('*').eq('po_number', po);

    console.log(`S1: Items=${item?.length}, Headers=${header?.length}`);

    const po9 = '4500002009';
    const { data: item9 } = await supabase.from('ekpo').select('*').eq('po_number', po9);
    const { data: header9 } = await supabase.from('ekko').select('*').eq('po_number', po9);

    console.log(`S9: Items=${item9?.length}, Headers=${header9?.length}`);
}

check();
