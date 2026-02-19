import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function runSqlFile(filePath: string) {
    const sql = fs.readFileSync(filePath, 'utf8')
    console.log(`Executing SQL from ${filePath}...`)

    // Note: Supabase JS client doesn't have a direct 'query' method for raw SQL.
    // We will use the REST API via rpc if a generic 'exec_sql' function exists, 
    // or we will interpret the C1-001 script specifically for this test.

    try {
        // Specific logic for C1-001 prep since we can't run arbitrary SQL strings easily without a postgres client or specific RPC
        // Let's try to do it via the JS API for better reliability

        // 1. Upsert EKPO
        const { error: ekpoError } = await supabase
            .from('ekpo')
            .upsert({
                po_number: '4500001005',
                line_item: 10,
                material: 'Tech Consulting - Level 1',
                ordered_qty: 10,
                unit_price: 50.00,
                vendor_name: 'TechGap Solutions'
            }, { onConflict: 'po_number,line_item' })

        if (ekpoError) throw ekpoError
        console.log('Successfully upserted EKPO record.')

        // 2. Cleanup Invoices for this PO
        const { error: invError } = await supabase
            .from('invoices')
            .delete()
            .eq('po_reference', '4500001005')

        if (invError) throw invError
        console.log('Successfully cleaned up old invoices for PO 4500001005.')

        console.log('PREPARATION COMPLETE.')
    } catch (err) {
        console.error('Error during database preparation:', err)
        process.exit(1)
    }
}

const args = process.argv.slice(2)
const file = args[0] || 'testing/test scripts/C1-001_initial_prep.sql'
runSqlFile(file)
