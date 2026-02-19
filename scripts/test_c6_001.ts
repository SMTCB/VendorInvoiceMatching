import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_INQUIRY_WEBHOOK_URL

console.log('SUPABASE_URL:', SUPABASE_URL)
console.log('WEBHOOK_URL:', WEBHOOK_URL)

async function testC6_001() {
    console.log('--- STARTING TEST C6-001: MANUAL INQUIRY ---')
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Get a suitable invoice (e.g. the one from C5-001)
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

    // 2. Trigger Webhook (Simulate UI Click)
    console.log('Triggering N8N Inquiry Webhook...')
    try {
        const response = await fetch(WEBHOOK_URL!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                invoice_id: inv.id,
                invoice_number: inv.invoice_number,
                vendor: inv.vendor_name_extracted,
                reason: inv.exception_reason,
                custom_note: 'TEST NOTE: This is a manual inquiry test for C6-001. Please ignore.'
            })
        })

        if (!response.ok) {
            console.error('Webhook failed with status:', response.status)
            return
        }
        console.log('Webhook triggered successfully.')
    } catch (err) {
        console.error('Error triggering webhook:', err)
        return
    }

    // 3. Polling for Status Transition (AWAITING_INFO)
    console.log('Polling Supabase for status update...')
    for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        const { data: updatedInv, error: checkError } = await supabase
            .from('invoices')
            .select('status')
            .eq('id', inv.id)
            .single()

        if (checkError) {
            console.error('Error checking status:', checkError)
            break
        }

        console.log(`Attempt ${i + 1}: Current Status = ${updatedInv.status}`)
        if (updatedInv.status === 'AWAITING_INFO') {
            console.log('✅ SUCCESS: Invoice status transitioned to AWAITING_INFO.')
            return
        }
    }

    console.error('❌ FAILURE: Invoice status did not transition to AWAITING_INFO in time.')
}

testC6_001()
