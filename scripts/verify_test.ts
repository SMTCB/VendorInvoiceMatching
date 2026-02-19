import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function verify() {
    console.log('--- VERIFICATION START ---')
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('po_reference', '4500001005')
        .order('created_at', { ascending: false })
        .limit(1)

    if (error) {
        console.error('Error fetching data:', error.message)
        process.exit(1)
    }

    if (!data || data.length === 0) {
        console.log('No record found yet. Ingestion might still be in progress.')
        return
    }

    const inv = data[0]
    console.log('--- INVOICE RECORD FOUND ---')
    console.log('ID:', inv.id)
    console.log('Status:', inv.status)
    console.log('Vendor:', inv.vendor_name_extracted)
    console.log('Total:', inv.total_amount)
    console.log('Audit Trail:', inv.audit_trail)
    console.log('Exception Reason:', inv.exception_reason)
    console.log('--- VERIFICATION END ---')
}

verify()
