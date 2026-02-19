
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function check() {
    console.log('URL:', SUPABASE_URL);
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const po = '4500002001';

    // Fetch Header
    const { data: header, error: headerError } = await supabase
        .from('ekko')
        .select('*')
        .eq('po_number', po)
        .single();

    if (headerError) {
        console.error('Header Error:', headerError.message);
    } else {
        console.log('--- PO HEADER (ekko) ---');
        console.log(header);
    }

    // Fetch Lines
    const { data: lines, error: linesError } = await supabase
        .from('ekpo')
        .select('*')
        .eq('po_number', po);

    if (linesError) {
        console.error('Lines Error:', linesError.message);
    } else {
        console.log('--- PO LINES (ekpo) ---');
        console.log('Count:', lines?.length);
        console.log(JSON.stringify(lines, null, 2));
    }
}

check();
