
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function reproFetch(po_ref: string) {
    console.log(`--- Repro Fetch for: "${po_ref}" ---`);

    // Equivalent of REPLACE(REPLACE(..., 'PO', ''), ' ', '')
    const cleanRef = po_ref.replace('PO', '').replace(/\s+/g, '').trim();
    console.log(`Clean Ref: "${cleanRef}"`);

    const { data: po_lines, error } = await supabase.rpc('execute_sql_query', {
        query_text: `
            SELECT COALESCE(json_agg(t), '[]'::json) as po_lines
            FROM (
              SELECT 
                Item.po_number, 
                Item.line_item, 
                Item.material, 
                Item.ordered_qty as open_qty, 
                Item.unit_price,
                Header.currency
              FROM ekpo as Item
              JOIN ekko as Header ON Item.po_number = Header.po_number
              WHERE Item.po_number = '${cleanRef}'
            ) t;
        `
    });

    if (error) {
        // If RPC isn't available, we'll do it manually
        console.log('RPC Failed (expected if not enabled), doing manual join...');
        const { data: items } = await supabase.from('ekpo').select('*').eq('po_number', cleanRef);
        const { data: headers } = await supabase.from('ekko').select('*').eq('po_number', cleanRef);
        console.log('Manual Items:', items?.length);
        console.log('Manual Headers:', headers?.length);
    } else {
        console.log('RPC Result:', JSON.stringify(po_lines, null, 2));
    }
}

reproFetch('4500002001');
