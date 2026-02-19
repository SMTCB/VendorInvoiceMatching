
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_URL = 'http://localhost:5678/webhook/test-matching';

async function triggerFromDB() {
    console.log('Fetching PROCESSING invoice...');

    const { data: invoice, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('status', 'PROCESSING')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !invoice) {
        console.error('No invoice found or error:', error);
        return;
    }

    console.log(`Found Invoice: ${invoice.id} (${invoice.invoice_number})`);

    // Construct payload for Workflow 2
    // W2 expects { extracted_data: { ... }, google_file_id: ... }
    const payload = {
        extracted_data: {
            invoice_number: invoice.invoice_number,
            po_reference: invoice.po_reference,
            vendor_name: invoice.vendor_name_extracted,
            total_amount: invoice.total_amount,
            currency: invoice.currency,
            line_items: typeof invoice.line_items === 'string'
                ? JSON.parse(invoice.line_items)
                : invoice.line_items,
            text: "-- Reconstructed from DB --" // Mock text content
        },
        google_file_id: invoice.google_file_id
    };

    console.log('Payload prepared. Sending to webhook...');

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('Webhook triggered successfully.');
        } else {
            console.error(`Webhook failed: ${response.status} ${response.statusText}`);
            console.error(await response.text());
        }
    } catch (err) {
        console.error('Network error:', err);
    }
}

triggerFromDB();
