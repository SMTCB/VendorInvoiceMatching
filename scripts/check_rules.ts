
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- Checking Rules ---');
    const { data: rules } = await supabase.from('validator_rules').select('*');
    console.log('Rules:', JSON.stringify(rules, null, 2));

    console.log('--- Checking AI Examples ---');
    const { data: ai } = await supabase.from('ai_learning_examples').select('*').limit(5);
    console.log('AI Examples (Sample):', JSON.stringify(ai, null, 2));
}

check();
