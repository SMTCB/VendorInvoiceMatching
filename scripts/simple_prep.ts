import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function run() {
    console.log('--- DB PREP START ---')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        process.exit(1)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    try {
        console.log('Upserting EKPO (Minimal Columns)...')
        // Only using columns confirmed in previous views or likely to exist
        const { error: ekpoError } = await supabase
            .from('ekpo')
            .upsert({
                po_number: '4500001005',
                line_item: 10,
                material: 'Tech Consulting - Level 1',
                ordered_qty: 10,
                unit_price: 50.00
            }, { onConflict: 'po_number,line_item' })

        if (ekpoError) throw ekpoError
        console.log('OK: EKPO record set (vendor_name omitted).')

        console.log('Cleaning up old invoices...')
        const { error: invError } = await supabase
            .from('invoices')
            .delete()
            .eq('po_reference', '4500001005')

        if (invError) throw invError
        console.log('OK: Invoices cleared.')

        console.log('--- PREPARATION SUCCESSFUL ---')
    } catch (err: any) {
        console.error('CRITICAL ERROR:', err.message)
        process.exit(1)
    }
}

run()
