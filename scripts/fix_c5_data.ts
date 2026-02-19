import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function fixData() {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    console.log('--- RESETTING DATA FOR TEST C5-001 ---')

    // 1. Clear dependent Invoices first (to avoid foreign key errors)
    const { error: invError } = await supabase.from('invoices').delete().eq('po_reference', '4500001005')
    if (invError) console.error('Error clearing invoices:', invError)
    else console.log('Cleared previous invoices for 4500001005.')

    // 2. Clear PO Lines (ekpo)
    const { error: lineError } = await supabase.from('ekpo').delete().eq('po_number', '4500001005')
    if (lineError) console.error('Error clearing lines:', lineError)

    // 3. Clear PO Header (ekko)
    const { error: headError } = await supabase.from('ekko').delete().eq('po_number', '4500001005')
    if (headError) console.error('Error clearing header:', headError)

    // 4. Upsert PO Header (USD Currency)
    const { error: newHeadError } = await supabase.from('ekko').upsert({
        po_number: '4500001005',
        vendor_id: '1001',
        company_code: '1000',
        currency: 'USD' // Ensures currency mismatch with EUR invoice
    }, { onConflict: 'po_number' })

    if (newHeadError) console.error('Error creating header:', newHeadError)
    else console.log('Upserted PO Header (USD).')

    // 5. Upsert PO Lines
    const { error: newLineError } = await supabase.from('ekpo').upsert({
        po_number: '4500001005',
        line_item: 10,
        material: 'Tech Consulting - Level 1',
        ordered_qty: 10,
        unit_price: 50.00
    }, { onConflict: 'po_number,line_item' })
    if (newLineError) console.error('Error creating lines:', newLineError)
    else console.log('Upserted PO Line Items.')

    console.log('--- READY FOR TEST C5-001 ---')
}

fixData()
