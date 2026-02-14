import { getInvoice, getInvoices } from './lib/data/mock-invoices';

async function verify() {
    console.log("Verifying Mock Data Logic...");

    const all = await getInvoices();
    console.log(`Total Invoices: ${all.length}`);
    all.forEach(i => console.log(` - ID: ${i.id}`));

    const targetId = 'inv-001';
    console.log(`\nLooking up ID: ${targetId}`);
    const match = await getInvoice(targetId);

    if (match) {
        console.log("✅ Found match:", match.id);
    } else {
        console.error("❌ Failed to find match for", targetId);
    }
}

verify().catch(console.error);
