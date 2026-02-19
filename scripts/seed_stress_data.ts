
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedStressData() {
    console.log('--- SEEDING STRESS TEST DATA (20 SCENARIOS) ---');
    if (!supabaseKey) {
        console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is MISSING!');
        process.exit(1);
    }
    console.log('Service Role Key Loaded:', supabaseKey.slice(0, 5) + '...');

    const scenariosPath = path.resolve(process.cwd(), 'testing/stress_test/scenarios.json');
    const scenarios = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));

    // 1. Vendors
    console.log('1. Seeding Vendors...');
    // Unique vendors from scenarios
    const vendorMap = new Map();
    scenarios.forEach((s: any) => {
        if (!vendorMap.has(s.vendor)) {
            let email = 'ar@techgapsolutions.com';
            if (s.vendor.includes('(EUR)')) email = 'eu@techgap.com';
            if (s.vendor.includes('LLC')) email = 'llc@techgap.com';
            vendorMap.set(s.vendor, {
                vendor_id: '1000' + (50 + vendorMap.size), // 100050, 100051...
                name: s.vendor,
                email: email
                // Country removed as it's not in schema
            });
        }
    });

    const vendors = Array.from(vendorMap.values());
    const { error: vErr } = await supabase.from('lfa1').upsert(vendors);
    if (vErr) console.error('Error seeding vendors:', vErr);
    else console.log(`✔ ${vendors.length} Vendors seeded.`);

    // 2. POs, Items, GRs
    console.log('2. Seeding POs, Items, and GRs...');
    const ekko = [];
    const ekpo = [];
    const mseg = [];
    const ai_examples = [];

    // Helper to find vendor ID
    const getVendorId = (name: string) => vendorMap.get(name)?.vendor_id || '100050';

    for (const s of scenarios) {
        if (!s.po_data) continue;

        // Header
        ekko.push({
            po_number: s.po_data.number,
            vendor_id: getVendorId(s.vendor), // Should match Invoice Vendor mostly, or intentional mismatch?
            // Note: In S8 Fuzzy, Invoice says "LLC", but PO matches correct vendor? 
            // Usually PO is raised to the CORRECT vendor. Invoice might have Typo.
            // If S8 is Fuzzy Match, the PO should exist for the "Real" vendor usually. 
            // But for simplicity, let's assume PO matches the Scenario "Vendor" string unless specified.
            // Wait, S8 Invoice Vendor is "TechGap LLC". PO should be "TechGap Solutions" logic wise if it's a "Match"?
            // Or maybe LLM figures it out. Let's ensure PO exists for the Vendor defined in data.
            currency: s.po_data.currency
        });

        // Items
        ekpo.push({
            po_number: s.po_data.number,
            line_item: s.po_data.item,
            material: 'MAT-' + s.id,
            ordered_qty: s.po_data.qty,
            unit_price: s.po_data.price
        });

        // Extra PO Lines
        if (s.extra_po_lines) {
            s.extra_po_lines.forEach((l: any) => {
                ekpo.push({
                    po_number: s.po_data.number,
                    line_item: l.item,
                    material: 'MAT-' + s.id + '-EXTRA',
                    ordered_qty: l.qty,
                    unit_price: l.price
                });
            });
        }

        // GRs
        if (s.gr_data) {
            mseg.push({
                po_number: s.po_data.number,
                po_line_item: s.po_data.item,
                received_qty: s.gr_data.received_qty,
                movement_date: new Date().toISOString()
            });
        }

        if (s.extra_gr_data) {
            s.extra_gr_data.forEach((g: any) => {
                mseg.push({
                    po_number: s.po_data.number,
                    po_line_item: g.item,
                    received_qty: g.received_qty,
                    movement_date: new Date().toISOString()
                });
            });
        }

        // AI Seeding
        if (s.ai_seed) {
            ai_examples.push({
                vendor_name: s.vendor,
                scenario_description: `${s.ai_seed.field} Mismatch (${s.ai_seed.original} -> ${s.ai_seed.new})`,
                user_rationale: s.ai_seed.reason,
                expected_status: 'READY_TO_POST',
                created_at: new Date(Date.now() - 86400000).toISOString()
            });
        }
    }

    // Deduplicate EKKO (Header)
    const uniqueEkko = Array.from(new Map(ekko.map(item => [item.po_number, item])).values());

    // Batch Upsert
    if (uniqueEkko.length) {
        const { error: ekkoErr } = await supabase.from('ekko').upsert(uniqueEkko);
        if (ekkoErr) console.error('Error upserting ekko:', ekkoErr);
    }
    // Deduplicate EKPO (Items)
    const uniqueEkpo = Array.from(new Map(ekpo.map(item => [`${item.po_number}-${item.line_item}`, item])).values());

    // Deduplicate MSEG (GRs)
    // Note: MSEG usually doesn't have a unique constraint like this unless enforced. 
    // But let's assume we don't want to double-insert for same PO/Line in this seed script if it represents same event.
    // However, mseg usually tracks history. But primary key? mseg usually has ID. 
    // If we upsert without ID, it inserts NEW rows every time unless onConflict matches something.
    // We didn't specify onConflict for mseg. So it effectively INSERTS.
    // But wait, if we run seed twice, we get duplicates?
    // Let's leave mseg as is for now, or dedupe to be safe against S14 issue if we decide to add onConflict later.
    // Actually, S14 re-using PO means we simply generate data twice.
    // If we use upsert without conflict target, it's an INSERT. 
    // The previous error "ON CONFLICT DO UPDATE command cannot affect row a second time" applies to UPSERT with conflict target.
    // Did mseg have conflict target? No. 
    // Did ekpo have conflict target? Yes: 'po_number,line_item'.
    // So the error came from ekpo.

    if (uniqueEkpo.length) {
        const { error: ekpoErr } = await supabase.from('ekpo').upsert(uniqueEkpo, { onConflict: 'po_number,line_item' });
        if (ekpoErr) console.error('Error upserting ekpo:', ekpoErr);
    }
    if (mseg.length) {
        const { error: msegErr } = await supabase.from('mseg').insert(mseg);
        if (msegErr) console.error('Error inserting mseg:', msegErr);
    }

    // AI Examples
    if (ai_examples.length) {
        console.log('Seeding AI Examples...');
        const { error: aiErr } = await supabase.from('ai_learning_examples').upsert(ai_examples);
        if (aiErr) console.error('Error upserting AI Examples:', aiErr);
    }

    console.log(`✔ Seeded: ${ekko.length} POs, ${ekpo.length} Lines, ${mseg.length} GRs.`);
    console.log('--- DATA SEEDING COMPLETE ---\n');
}

seedStressData().catch(console.error);
