
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function crossCheck() {
    console.log('--- Cross-Checking EKKO vs EKPO ---');

    const { data: headers } = await supabase.from('ekko').select('po_number');
    const { data: items } = await supabase.from('ekpo').select('po_number');

    const headerSet = new Set(headers?.map(h => h.po_number));
    const itemSet = new Set(items?.map(i => i.po_number));

    console.log('Total Headers:', headerSet.size);
    console.log('Total Item POs:', itemSet.size);

    const missingInItems = [...headerSet].filter(h => !itemSet.has(h));
    const missingInHeaders = [...itemSet].filter(i => !headerSet.has(i));

    console.log('\nHeaders with NO Items:', missingInItems);
    console.log('Items with NO Headers:', missingInHeaders);

    const targetPOs = ['4500002001', '4500002009'];
    for (const po of targetPOs) {
        console.log(`\nPO: ${po}`);
        console.log(`  In Header Set: ${headerSet.has(po)}`);
        console.log(`  In Item Set: ${itemSet.has(po)}`);
    }
}

crossCheck();
