import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function check() {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { data: invs, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

    if (error) {
        console.error(error)
        return
    }

    if (invs && invs.length > 0) {
        const inv = invs[0]
        console.log('--- FULL INVOICE DUMP ---')
        console.log(JSON.stringify(inv, null, 2))
    } else {
        console.log('No invoices found.')
    }
}

check()
