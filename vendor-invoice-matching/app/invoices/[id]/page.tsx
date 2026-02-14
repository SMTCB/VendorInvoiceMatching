import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/invoice-status-badge'
import { InvoiceActions } from '@/components/invoice-actions'
import { ChevronLeft, Check, AlertTriangle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: { id: string }
}

export default async function InvoiceDetailPage({ params }: PageProps) {
    const supabase = createClient()

    // Fetch Invoice Header
    const { data: invoice, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', params.id)
        .single()

    if (invError || !invoice) {
        return notFound()
    }

    // Fetch Related PO Items if PO exists
    let poItems: any[] = []
    if (invoice.po_reference) {
        const { data: items } = await supabase
            .from('ekpo')
            .select('*')
            .eq('po_number', invoice.po_reference)
            .order('line_item', { ascending: true })

        poItems = items || []
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 h-16">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-500 hover:text-gray-900">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-semibold text-gray-900">
                        Invoice #{invoice.invoice_number}
                    </h1>
                    <StatusBadge status={invoice.status} />
                </div>
                <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: PDF Viewer */}
                <div className="w-1/2 bg-gray-800 border-r border-gray-200 flex flex-col">
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        {invoice.pdf_link ? (
                            <iframe src={invoice.pdf_link} className="w-full h-full" title="PDF Viewer" />
                        ) : (
                            <div className="text-center">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>No PDF Document Linked</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Data & Matching */}
                <div className="w-1/2 bg-white flex flex-col overflow-y-auto">
                    <div className="p-6 space-y-8">
                        {/* Header Info */}
                        <section className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Vendor</label>
                                <div className="mt-1 text-sm font-medium text-gray-900">{invoice.vendor_name_extracted}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">PO Reference</label>
                                <div className="mt-1 text-sm font-medium text-gray-900">{invoice.po_reference || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Invoice Date</label>
                                <div className="mt-1 text-sm text-gray-900">{new Date(invoice.created_at).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Total Amount</label>
                                <div className="mt-1 text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total_amount || 0)}
                                </div>
                            </div>
                        </section>

                        {/* Matching Section */}
                        <section>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                3-Way Match Verification
                                <span className="text-xs font-normal text-gray-500">(Invoice vs PO vs GR)</span>
                            </h3>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">PO Qty</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">PO Price</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Match</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {poItems.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div className="font-medium">{item.material}</div>
                                                    <div className="text-xs text-gray-500">Line {item.line_item}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900">{item.ordered_qty}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900">${item.unit_price}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {/* Mock matching logic visual */}
                                                    <Check className="w-4 h-4 text-green-500 mx-auto" />
                                                </td>
                                            </tr>
                                        ))}
                                        {poItems.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                                                    No PO items found for comparison.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Exceptions / Messages */}
                        {invoice.exception_reason && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Blocking Exception</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{invoice.exception_reason}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
