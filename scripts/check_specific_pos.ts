
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- Checking S3 (4500002003) & S18 (4500002018) ---');

    const pos = ['4500002001'];

    for (const po of pos) {
        console.log(`\nPO: ${po}`);
        const { data: header } = await supabase.from('ekko').select('*').eq('po_number', po);
        console.log('Header:', header);

        const { data: items } = await supabase.from('ekpo').select('*').eq('po_number', po);
        console.log('Items:', items);
    }
}

check();
