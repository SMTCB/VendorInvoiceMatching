
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedStressPOs() {
    console.log('Seeding Stress Test POs...');

    const headers = [
        { po_number: '4500001001', vendor_id: '100050', company_code: '1000', currency: 'USD' },
        { po_number: '4500001002', vendor_id: '100050', company_code: '1000', currency: 'USD' },
    ];

    const items = [
        // For C2-001, C2-002, C2-003, C4-001, C5-001, C7-001
        { po_number: '4500001001', line_item: 10, material: 'Tech Consulting', ordered_qty: 1, unit_price: 100.00 },
        // For C3-001 (Partial Delivery)
        { po_number: '4500001002', line_item: 10, material: 'Raw Materials', ordered_qty: 20, unit_price: 100.00 },
    ];

    await supabase.from('ekko').upsert(headers);
    await supabase.from('ekpo').upsert(items, { onConflict: 'po_number,line_item' });

    console.log('Stress Test POs seeded successfully.');
}

seedStressPOs().catch(console.error);
