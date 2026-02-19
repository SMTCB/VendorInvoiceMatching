
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDb() {
    console.log('--- CLEARING DATABASE FOR STRESS TEST ---');

    // Deleting in order of foreign key dependencies (child first)
    // 1. Invoices (child of nothing strict, but central)
    const { error: invError } = await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (invError) console.error('Error clearing invoices:', invError);
    else console.log('✔ Invoices cleared.');

    // 2. Goods Receipts (mseg) - Refers to POs
    const { error: grError } = await supabase.from('mseg').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (grError) console.error('Error clearing MSEG:', grError);
    else console.log('✔ Goods Receipts cleared.');

    // 3. PO Items (ekpo) - Refers to Headers
    const { error: ekpoError } = await supabase.from('ekpo').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (ekpoError) console.error('Error clearing EKPO:', ekpoError);
    else console.log('✔ PO Items cleared.');

    // 4. PO Headers (ekko) - Refers to Vendors
    const { error: ekkoError } = await supabase.from('ekko').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (ekkoError) console.error('Error clearing EKKO:', ekkoError);
    else console.log('✔ PO Headers cleared.');

    // 5. Vendors (lfa1)
    const { error: lfa1Error } = await supabase.from('lfa1').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (lfa1Error) console.error('Error clearing LFA1:', lfa1Error);
    else console.log('✔ Vendors cleared.');

    console.log('--- DATABASE CLEARED ---\n');
}

clearDb().catch(console.error);
