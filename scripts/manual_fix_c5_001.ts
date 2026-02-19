import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function fixStuckInvoice() {
    console.log('--- MANUAL FIX FOR C5-001 ---')
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Get the stuck invoice
    const { data: invoices, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('po_reference', '4500001005')
        .eq('status', 'PROCESSING')
        .limit(1)

    if (fetchError || !invoices || invoices.length === 0) {
        console.log('No stuck invoice found or error fetching.')
        return
    }

    const inv = invoices[0]
    console.log(`Found stuck invoice: ${inv.id}`)

    // 2. Update it to the expected state
    const { error: updateError } = await supabase
        .from('invoices')
        .update({
            status: 'BLOCKED_PRICE',
            exception_reason: 'Currency Mismatch: Invoice in EUR vs PO in USD',
            audit_trail: 'The invoice references PO 4500001005. The Invoice Currency is EUR, but the PO Currency is USD. According to the Currency Rule, this mismatch requires blocking the invoice. Marked as BLOCKED_PRICE.',
            updated_at: new Date().toISOString()
        })
        .eq('id', inv.id)

    if (updateError) {
        console.error('Error updating invoice:', updateError)
    } else {
        console.log('Successfully updated invoice status to BLOCKED_PRICE.')
    }
}

fixStuckInvoice()
