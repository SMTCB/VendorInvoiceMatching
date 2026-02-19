
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: items } = await supabase.from('ekpo').select('po_number');
    const counts = items?.reduce((acc: any, curr: any) => {
        acc[curr.po_number] = (acc[curr.po_number] || 0) + 1;
        return acc;
    }, {});
    console.log('PO Item Counts:', counts);
}

check();
