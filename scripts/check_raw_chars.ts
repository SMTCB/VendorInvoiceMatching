
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data } = await supabase.from('ekko').select('po_number').eq('po_number', '4500002001').single();
    console.log('PO 2001 Raw:', JSON.stringify(data?.po_number));

    const { data: item } = await supabase.from('ekpo').select('po_number').eq('po_number', '4500002001').limit(1).single();
    console.log('Item 2001 Raw:', JSON.stringify(item?.po_number));
}

check();
