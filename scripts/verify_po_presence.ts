
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
    const { data: items } = await supabase.from('ekpo').select('po_number').eq('po_number', po);
    const { data: headers } = await supabase.from('ekko').select('po_number').eq('po_number', po);

    console.log('Items found:', items?.length);
    console.log('Headers found:', headers?.length);

    // Check for 2009 (the one that works)
    const poWorks = '4500002009';
    const { data: items2 } = await supabase.from('ekpo').select('po_number').eq('po_number', poWorks);
    const { data: headers2 } = await supabase.from('ekko').select('po_number').eq('po_number', poWorks);

    console.log('Items 2009 found:', items2?.length);
    console.log('Headers 2009 found:', headers2?.length);
}

check();
