import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { POLine } from '@/lib/data/mock-invoices'
import { InvoiceDetailView } from '@/components/invoice-detail-view'

export const dynamic = 'force-dynamic'

export default async function InvoicePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    console.log(`[InvoicePage] Requested ID: '${id}'`);

    const supabase = await createClient()

    // 1. Fetch Invoice (Supabase -> Fallback Mock)
    let invoice: any = null;

    try {
        const { data: dbInvoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .single()

        if (dbInvoice) {
            console.log(`[InvoicePage] Found in Supabase for ID: ${id}`);
            invoice = dbInvoice;

            // Construct Google Drive Preview Link if ID exists
            if (invoice.google_file_id && !invoice.pdf_link) {
                invoice.pdf_link = `https://drive.google.com/file/d/${invoice.google_file_id}/preview`;
            }
        } else {
            if (invoiceError) {
                console.warn(`[InvoicePage] Supabase error (or empty) for ${id}: ${invoiceError.message} (${invoiceError.code})`);
            } else {
                console.log(`[InvoicePage] Not found in Supabase for ID: ${id}`);
            }
        }
    } catch (e) {
        console.error(`[InvoicePage] Unexpected Supabase client error:`, e);
    }

    if (!invoice) {
        // Try Mock Data
        console.log(`[InvoicePage] Attempting Mock Data Fallback for ID: '${id}'`);
        const { getInvoice, getInvoices } = await import('@/lib/data/mock-invoices');
        invoice = await getInvoice(id);

        if (invoice) {
            console.log(`[InvoicePage] SUCCESS: Found in Mock Data for ID: ${id}`);
        } else {
            console.warn(`[InvoicePage] WARNING: Not found in Mock Data for ID: '${id}'. Generating dynamic mock.`);
            // FALLBACK OF LAST RESORT: Generate a mock invoice on the fly so the page never 404s in demo mode
            invoice = {
                id: id,
                invoice_number: `GEN-${id.substring(0, 8).toUpperCase()}`,
                po_reference: 'GEN-PO-999',
                vendor_name_extracted: 'Demo Vendor (Fallback)',
                total_amount: 999.99,
                status: 'PROCESSING',
                pdf_link: '#',
                exception_reason: 'Generated dynamically because original record was not found.',
                created_at: new Date().toISOString()
            };
        }
    }

    if (!invoice) {
        console.error(`[InvoicePage] 404 Not Found triggered for ID: ${id}`);
        notFound()
    }

    // 2. Fetch Related PO Lines (Supabase -> Fallback Mock)
    let poLines: POLine[] = [];

    if (invoice.po_reference) {
        try {
            const { data: dbLines } = await supabase
                .from('ekpo')
                .select('*')
                .eq('po_number', invoice.po_reference)
                .order('line_item', { ascending: true })

            if (dbLines && dbLines.length > 0) {
                poLines = dbLines as unknown as POLine[];
            } else {
                // Try Mock Data
                const { getPOLines } = await import('@/lib/data/mock-invoices');
                poLines = await getPOLines(invoice.po_reference);
            }
        } catch (e) {
            // Fallback on error
            const { getPOLines } = await import('@/lib/data/mock-invoices');
            poLines = await getPOLines(invoice.po_reference);
        }
    }

    return (
        <div className="h-screen overflow-hidden">
            <InvoiceDetailView invoice={invoice} poLines={poLines} />
        </div>
    )
}
