import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function run() {
    console.log('--- DB PREP [C2-001] START ---')
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    try {
        console.log('Upserting EKPO for PO 4500001005...')
        await supabase.from('ekpo').upsert({
            po_number: '4500001005',
            line_item: 10,
            material: 'Tech Consulting - Level 1',
            ordered_qty: 10,
            unit_price: 50.00
        }, { onConflict: 'po_number,line_item' })

        console.log('Cleaning up PO 4500001005 invoices...')
        await supabase.from('invoices').delete().eq('po_reference', '4500001005')

        console.log('--- PREPARATION SUCCESSFUL ---')
    } catch (err: any) {
        console.error('CRITICAL ERROR:', err.message)
        process.exit(1)
    }
}

run()
