
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function clearDb() {
    console.log('Cleaning invoices table...');
    const { error } = await supabase
        .from('invoices')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000' as any);

    if (error) {
        console.error('Error clearing DB:', error);
    } else {
        console.log('Database Cleared Successfully');
    }
}

clearDb();
