
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    const { data: s1 } = await supabase.from('ekpo').select('po_number').eq('po_number', '4500002001').limit(1);
    const { data: s9 } = await supabase.from('ekpo').select('po_number').eq('po_number', '4500002009').limit(1);

    console.log('S1 Raw:', JSON.stringify(s1?.[0]?.po_number));
    console.log('S9 Raw:', JSON.stringify(s9?.[0]?.po_number));
}

check();
