import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log('Seeding data...');

  // 1. Vendors
  const vendors = [
    { vendor_id: '100050', name: 'Acme Corp', email: 'billing@acme.com' },
    { vendor_id: '100051', name: 'Globex Inc', email: 'finance@globex.com' },
    { vendor_id: '100052', name: 'Soylent Corp', email: 'ar@soylent.com' },
  ];

  const { error: vendorError } = await supabase.from('lfa1').upsert(vendors);
  if (vendorError) console.error('Error inserting vendors:', vendorError);
  else console.log('Vendors inserted.');

  // 2. PO Headers
  const pos = [
    { po_number: '4500001234', vendor_id: '100050', company_code: '1000' },
    { po_number: '4500001235', vendor_id: '100051', company_code: '1000' },
  ];

  const { error: poError } = await supabase.from('ekko').upsert(pos);
  if (poError) console.error('Error inserting POs:', poError);
  else console.log('POs inserted.');

  // 3. PO Items
  const poItems = [
    { po_number: '4500001234', line_item: 10, material: 'Widget A', ordered_qty: 100, unit_price: 10.00 },
    { po_number: '4500001234', line_item: 20, material: 'Widget B', ordered_qty: 50, unit_price: 25.00 },
    { po_number: '4500001235', line_item: 10, material: 'Gadget X', ordered_qty: 200, unit_price: 5.00 },
  ];

  const { error: itemError } = await supabase.from('ekpo').upsert(poItems, { onConflict: 'po_number,line_item' });
  if (itemError) console.error('Error inserting PO Items:', itemError);
  else console.log('PO Items inserted.');

  // 4. Goods Receipts
  const grs = [
    { po_number: '4500001234', po_line_item: 10, received_qty: 100, movement_date: new Date().toISOString() },
    { po_number: '4500001234', po_line_item: 20, received_qty: 50, movement_date: new Date().toISOString() },
     // Partial delivery for PO 4500001235
    { po_number: '4500001235', po_line_item: 10, received_qty: 100, movement_date: new Date().toISOString() },
  ];

  const { error: grError } = await supabase.from('mseg').upsert(grs);
  if (grError) console.error('Error inserting GRs:', grError);
  else console.log('Goods Receipts inserted.');

  console.log('Seeding complete.');
}

seedData();
