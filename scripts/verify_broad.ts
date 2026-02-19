import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function verify() {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

    if (data) {
        data.forEach(inv => {
            console.log(`[${inv.status}] ${inv.vendor_name_extracted} - Total: ${inv.total_amount} - PO: ${inv.po_reference} - Trail: ${inv.audit_trail}`);
        });
    }
}

verify()
