import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function run() {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    // Note: We can't run pure DDL through the standard JS client easily if RLS is on and we don't have an RPC.
    // However, we can try to "ping" the table or just proceed with the n8n update if we assume the user can add it.
    // Actually, I'll just check if the column is there.
    const { data, error } = await supabase.from('invoices').select('line_items').limit(1)
    if (error && error.message.includes('column "line_items" does not exist')) {
        console.log('COLUMN_MISSING')
    } else {
        console.log('COLUMN_HEALTHY')
    }
}

run()
