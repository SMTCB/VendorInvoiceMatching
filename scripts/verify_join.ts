
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
    const { data: join } = await supabase.rpc('run_sql', {
        sql_query: `
        SELECT count(*) 
        FROM ekpo as Item
        JOIN ekko as Header ON Item.po_number = Header.po_number
        WHERE Item.po_number = '${po}'
    ` });
    console.log('Join count for S1:', join);

    const { data: join9 } = await supabase.rpc('run_sql', {
        sql_query: `
        SELECT count(*) 
        FROM ekpo as Item
        JOIN ekko as Header ON Item.po_number = Header.po_number
        WHERE Item.po_number = '4500002009'
    ` });
    console.log('Join count for S9:', join9);
}

check();
