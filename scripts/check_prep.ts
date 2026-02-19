import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function check() {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { data: rules } = await supabase.from('validator_rules').select('*')
    console.log('RULES:', rules?.length || 0)

    const { data: examples } = await supabase.from('ai_learning_examples').select('*')
    console.log('EXAMPLES:', examples?.length || 0)
}

check()
