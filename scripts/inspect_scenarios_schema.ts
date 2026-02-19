
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect(table: string) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) console.error(error);
    else console.log(`${table} Keys:`, data && data.length > 0 ? Object.keys(data[0]) : 'Empty');
}

async function run() {
    await inspect('ai_learning_examples');
    await inspect('validator_rules');
}

run();
