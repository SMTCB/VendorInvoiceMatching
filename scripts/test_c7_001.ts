
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyLearningExample() {
    console.log('--- Verifying AI Learning Example Creation (C7-001) ---');

    // Fetch the most recent learning example
    const { data: examples, error } = await supabase
        .from('ai_learning_examples')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching learning examples:', error);
        return;
    }

    if (!examples || examples.length === 0) {
        console.log('No learning examples found. Please trigger the "Train AI" action in the UI first.');
        return;
    }

    const latest = examples[0];
    console.log('Latest Learning Example Found:');
    console.log('- ID:', latest.id);
    console.log('- Invoice ID:', latest.invoice_id);
    console.log('- Vendor:', latest.vendor_name);
    console.log('- Rationale:', latest.user_rationale);
    console.log('- Expected Status:', latest.expected_status);
    console.log('- Created At:', latest.created_at);

    if (latest.user_rationale && latest.expected_status === 'READY_TO_POST') {
        console.log('\n✅ SUCCESS: Learning example correctly persisted with mandatory fields.');
    } else {
        console.log('\n❌ FAILURE: Learning example missing critical data.');
    }
}

verifyLearningExample().catch(console.error);
