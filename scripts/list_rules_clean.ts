
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listRules() {
    const { data: rules } = await supabase.from('validator_rules').select('*');
    if (rules) {
        console.log('--- RULES ---');
        rules.forEach(r => {
            console.log(`[${r.id}] ${r.name}: ${r.condition_field} ${r.operator} ${r.value} -> ${r.action}`);
        });
    }

    const { data: examples } = await supabase.from('ai_learning_examples').select('*');
    if (examples) {
        console.log('\n--- AI EXAMPLES ---');
        examples.forEach(e => {
            console.log(`[${e.vendor_name}] ${e.scenario_description}: ${e.user_rationale} (${e.expected_status})`);
        });
    }
}

listRules();
