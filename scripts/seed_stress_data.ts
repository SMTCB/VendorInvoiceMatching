
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedStressData() {
    console.log('--- SEEDING STRESS TEST DATA ---');

    console.log('1. Seeding Vendors...');
    const vendors = [
        { vendor_id: '100050', name: 'TechGap Solutions', email: 'ar@techgapsolutions.com', country: 'US' },
        { vendor_id: '100051', name: 'TechGap LLC', email: 'billing@techgapllc.com', country: 'US' }, // For Fuzzy Match
        { vendor_id: '100052', name: 'TechGap Solutions (EUR)', email: 'eu-billing@techgap.com', country: 'DE' }, // For Currency Limit
    ];
    const { error: vErr } = await supabase.from('lfa1').upsert(vendors);
    if (vErr) console.error('Error seeding vendors:', vErr);
    else console.log('✔ Vendors seeded.');


    console.log('2. Seeding PO Headers (EKKO)...');
    const pos = [
        // Standard PO for C2, C4, C5, C7
        { po_number: '4500001001', vendor_id: '100050', company_code: '1000', currency: 'USD', purchasing_group: '001' },
        // PO for Partial Delivery Scenarios (C3)
        { po_number: '4500001002', vendor_id: '100050', company_code: '1000', currency: 'USD', purchasing_group: '001' },
    ];
    const { error: ekkoErr } = await supabase.from('ekko').upsert(pos);
    if (ekkoErr) console.error('Error seeding EKKO:', ekkoErr);
    else console.log('✔ PO Headers seeded.');


    console.log('3. Seeding PO Items (EKPO)...');
    const poItems = [
        // PO 4500001001: 1 Item, Qty 10, Price $100
        { po_number: '4500001001', line_item: 10, material: 'TG-SERVER-001', description: 'Tech Server Unit', ordered_qty: 10, unit_price: 100.00, net_price: 100.00 },

        // PO 4500001002: 1 Item, Qty 20, Price $100
        { po_number: '4500001002', line_item: 10, material: 'TG-LICENSE-001', description: 'Software License Seat', ordered_qty: 20, unit_price: 100.00, net_price: 100.00 },
    ];
    const { error: ekpoErr } = await supabase.from('ekpo').upsert(poItems, { onConflict: 'po_number,line_item' });
    if (ekpoErr) console.error('Error seeding EKPO:', ekpoErr);
    else console.log('✔ PO Items seeded.');


    console.log('4. Seeding Goods Receipts (MSEG)...');
    // Assuming 3-way match requires GR.
    const grs = [
        // PO 4500001001: Full GR for 10 units (So invoice of 1 is fine, 5 is fine, 11 is blocked)
        { po_number: '4500001001', po_line_item: 10, received_qty: 10, movement_type: '101', movement_date: new Date().toISOString() },

        // PO 4500001002: Full GR for 20 units (So invoice of 10 or 5 is fine)
        { po_number: '4500001002', po_line_item: 10, received_qty: 20, movement_type: '101', movement_date: new Date().toISOString() },
    ];
    const { error: grErr } = await supabase.from('mseg').upsert(grs);
    if (grErr) console.error('Error seeding MSEG:', grErr);
    else console.log('✔ Goods Receipts seeded.');

    console.log('--- DATA SEEDING COMPLETE ---\n');
}

seedStressData().catch(console.error);
