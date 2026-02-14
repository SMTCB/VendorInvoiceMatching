import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertCircle, FileText, ExternalLink, ShieldAlert, DollarSign, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { POLine } from '@/lib/data/mock-invoices'

export const dynamic = 'force-dynamic'

// Define the shape of the invoice and related data
// In a real app, these would be imported from a types file
type Invoice = {
    id: string
    invoice_number: string
    po_reference: string
    vendor_name_extracted: string
    total_amount: number
    status: string
    pdf_link: string
    exception_reason: string | null
    created_at: string
}

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
        // This should logically never happen anymore, but just in case
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
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            Invoice #{invoice.invoice_number}
                            <StatusBadge status={invoice.status} />
                        </h1>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            <span className="font-medium">{invoice.vendor_name_extracted}</span>
                            <span>•</span>
                            <span>PO: {invoice.po_reference}</span>
                            <span>•</span>
                            <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
                        Reject
                    </button>
                    <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm flex items-center gap-2">
                        <CheckCircle size={16} />
                        Post Invoice
                    </button>
                </div>
            </header>

            {/* Main Split View */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Panel: PDF Viewer */}
                <div className="w-1/2 bg-slate-100 border-r border-slate-200 flex flex-col relative">
                    <div className="bg-slate-800 text-white text-xs px-4 py-2 flex items-center justify-between">
                        <span className="font-medium flex items-center gap-2"><FileText size={14} /> Original Document</span>
                        <a href={invoice.pdf_link || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 flex items-center gap-1">
                            Open in Drive <ExternalLink size={12} />
                        </a>
                    </div>
                    {/* Placeholder for PDF Viewer - In production this would be an iframe or PDF renderer */}
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="bg-white shadow-lg p-8 max-w-lg w-full h-[600px] border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <FileText size={48} className="text-slate-300" />
                            <p>PDF Preview Unavailable in Demo</p>
                            <p className="text-xs text-center max-w-xs">
                                In a real deployment, the PDF document would be rendered here using an iframe or PDF.js.
                            </p>
                            <a href={invoice.pdf_link} target="_blank" className="text-blue-600 text-sm hover:underline mt-4">Download PDF</a>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Matching Logic */}
                <div className="w-1/2 bg-white flex flex-col overflow-y-auto">

                    {/* Exception Alert */}
                    {invoice.status !== 'READY_TO_POST' && invoice.status !== 'POSTED' && (
                        <div className="p-6 bg-amber-50 border-b border-amber-100">
                            <div className="flex items-start gap-3">
                                <ShieldAlert className="text-amber-600 mt-0.5" size={20} />
                                <div>
                                    <h3 className="text-amber-900 font-semibold">Matching Exception Detected</h3>
                                    <p className="text-amber-800 text-sm mt-1">
                                        {invoice.exception_reason || 'The system detected discrepancies between the Invoice and Purchase Order.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Line Items Comparison */}
                    <div className="p-6">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                            Line Item Matching
                        </h3>

                        <div className="space-y-4">
                            {poLines && poLines.length > 0 ? (
                                poLines.map((line: POLine) => (
                                    <MatchingRow
                                        key={line.line_item}
                                        line={line}
                                        invoiceStatus={invoice.status}
                                    />
                                ))
                            ) : (
                                <div className="text-slate-500 text-sm italic py-4">No PO lines found to match against.</div>
                            )}
                        </div>
                    </div>

                    {/* Totals Section */}
                    <div className="mt-auto p-6 bg-slate-50 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="text-slate-900 font-medium">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total_amount || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-500">Tax estimate (0%)</span>
                            <span className="text-slate-900 font-medium">$0.00</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                            <span className="text-slate-900 font-bold">Total Payables</span>
                            <span className="text-2xl font-bold text-slate-900">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total_amount || 0)}
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function MatchingRow({ line, invoiceStatus }: { line: POLine, invoiceStatus: string }) {
    // Simple heuristic logic for the demo visualization
    // In a real app, we'd have precise matching data per line item from the backend
    const hasPriceVariance = invoiceStatus === 'BLOCKED_PRICE';
    const hasQtyVariance = invoiceStatus === 'BLOCKED_QTY';

    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-mono text-slate-400">Line {line.line_item}</span>
                    <h4 className="font-medium text-slate-900">{line.material}</h4>
                </div>
                {/* Mock Match Status */}
                <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">
                    Matched
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
                <div className={cn("p-2 rounded border", hasQtyVariance ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100")}>
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Package size={12} /> Quantity</div>
                    <div className="font-semibold text-slate-700">{line.ordered_qty} <span className="text-xs font-normal text-slate-400">Ordered</span></div>
                </div>
                <div className={cn("p-2 rounded border", hasPriceVariance ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100")}>
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><DollarSign size={12} /> Unit Price</div>
                    <div className="font-semibold text-slate-700">${line.unit_price} <span className="text-xs font-normal text-slate-400">/unit</span></div>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PROCESSING: 'bg-blue-100 text-blue-800',
        READY_TO_POST: 'bg-emerald-100 text-emerald-800',
        BLOCKED_PRICE: 'bg-amber-100 text-amber-800',
        BLOCKED_QTY: 'bg-orange-100 text-orange-800',
        POSTED: 'bg-slate-100 text-slate-800',
        REJECTED: 'bg-red-100 text-red-800',
        AWAITING_INFO: 'bg-purple-100 text-purple-800'
    }

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent/10", styles[status] || 'bg-gray-100 text-gray-800')}>
            {status.replace(/_/g, ' ')}
        </span>
    )
}
