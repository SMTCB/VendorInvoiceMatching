import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function testC6_002() {
    console.log('--- STARTING TEST C6-002: PARK INVOICE ---')
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Get the invoice we've been using (or any one)
    const { data: invoices, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('po_reference', '4500001005')
        .limit(1)

    if (fetchError || !invoices || invoices.length === 0) {
        console.error('No invoice found for testing.')
        return
    }

    const inv = invoices[0]
    console.log(`Using Invoice ID: ${inv.id} (${inv.invoice_number})`)
    console.log(`Initial Status: ${inv.status}`)

    // 2. Perform the update (Simulate handlePark action)
    console.log('Simulating Park Action (Direct Supabase Update)...')
    const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'PARKED' })
        .eq('id', inv.id)

    if (updateError) {
        console.error('Update failed:', updateError)
        return
    }

    // 3. Verify the transition
    const { data: updatedInv, error: checkError } = await supabase
        .from('invoices')
        .select('status')
        .eq('id', inv.id)
        .single()

    if (checkError) {
        console.error('Error checking status:', checkError)
        return
    }

    console.log(`Final Status: ${updatedInv.status}`)
    if (updatedInv.status === 'PARKED') {
        console.log('✅ SUCCESS: Invoice status transitioned to PARKED.')
    } else {
        console.error('❌ FAILURE: Invoice status did not transition to PARKED.')
    }
}

testC6_002()
