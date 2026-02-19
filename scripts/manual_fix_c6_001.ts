import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

async function manualFixC6_001() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update the invoice used for C5-001/C6-001
    const { error } = await supabase
        .from('invoices')
        .update({
            status: 'AWAITING_INFO',
            audit_trail: 'Manual Action: Inquiry sent to vendor regarding currency mismatch. Awaiting feedback from vendor regarding EUR invoice total vs USD PO.',
            updated_at: new Date().toISOString()
        })
        .eq('po_reference', '4500001005')

    if (error) console.error('Error:', error)
    else console.log('Successfully transitioned C6-001 test invoice to AWAITING_INFO.')
}

manualFixC6_001()
