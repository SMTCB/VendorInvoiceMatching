"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertCircle, FileText, ExternalLink, ShieldAlert, DollarSign, Package, Split, Wand2, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InvoiceCopilot } from './invoice-copilot'

// Re-defining simple types for props (or import if available)
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

type POLine = {
    id: string
    po_number: string
    line_item: number;
    material: string;
    ordered_qty: number;
    unit_price: number;
}

type InvoiceDetailViewProps = {
    invoice: Invoice;
    poLines: POLine[];
}

export function InvoiceDetailView({ invoice, poLines }: InvoiceDetailViewProps) {
    const [activeTab, setActiveTab] = useState<'matching' | 'copilot'>('matching');

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
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
                    <button
                        onClick={async () => {
                            if (!window.confirm('Send inquiry email to vendor?')) return;
                            try {
                                alert('Demo: Inquiry email trigger simulated successfully.');
                            } catch (e) {
                                alert('Demo: Inquiry email trigger simulated successfully.');
                            }
                        }}
                        className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm"
                    >
                        Send to Inquiry
                    </button>
                    <button
                        onClick={() => alert('Demo: Invoice status updated to "PARKED".')}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Park Invoice
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm hover:text-red-600 hover:border-red-200 transition-colors">
                        Reject
                    </button>
                    <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-all">
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
                    {/* Placeholder for PDF Viewer */}
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="bg-white shadow-lg p-8 max-w-lg w-full h-[600px] border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <FileText size={48} className="text-slate-300" />
                            <p>PDF Preview Unavailable in Demo</p>
                            <a href={invoice.pdf_link} target="_blank" className="text-blue-600 text-sm hover:underline mt-4">Download PDF</a>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Tabs & Content */}
                <div className="w-1/2 bg-white flex flex-col overflow-hidden">

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 bg-slate-50/50">
                        <button
                            onClick={() => setActiveTab('matching')}
                            className={cn(
                                "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                                activeTab === 'matching'
                                    ? "border-blue-600 text-blue-700 bg-white"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            )}
                        >
                            <Layers size={16} />
                            Matching & Lines
                        </button>
                        <button
                            onClick={() => setActiveTab('copilot')}
                            className={cn(
                                "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                                activeTab === 'copilot'
                                    ? "border-indigo-600 text-indigo-700 bg-white"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            )}
                        >
                            <Wand2 size={16} />
                            AI Copilot
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto">

                        {activeTab === 'matching' ? (
                            <div className="flex flex-col h-full">
                                {/* Exception Alert (Enhanced) */}
                                {invoice.status !== 'READY_TO_POST' && invoice.status !== 'POSTED' && (
                                    <div className="p-6 bg-amber-50 border-b border-amber-100">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-amber-100 p-2 rounded-full shrink-0">
                                                <ShieldAlert className="text-amber-600" size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-amber-900 font-semibold text-sm">Matching Exception Detected</h3>
                                                <p className="text-amber-800 text-sm mt-1">
                                                    {invoice.exception_reason || 'The system detected discrepancies between the Invoice and Purchase Order.'}
                                                </p>

                                                <button
                                                    onClick={() => alert(`Demo: Logic "${invoice.exception_reason}" saved to ai_learning_examples table for future reinforcement.`)}
                                                    className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5"
                                                >
                                                    <CheckCircle size={12} />
                                                    Save to Knowledge Base
                                                </button>
                                                <span className="text-xs text-amber-700/70 font-medium">
                                                    AI Confidence: 98%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Line Items */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                                            Line Item Matching
                                        </h3>
                                        <span className="text-xs text-slate-400">{poLines.length} items</span>
                                    </div>

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
                                            <div className="text-slate-500 text-sm italic py-4 text-center bg-slate-50 rounded-lg">
                                                No PO lines found to match against.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Totals Section */}
                                <div className="mt-auto p-6 bg-slate-50 border-t border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-500 text-sm">Subtotal</span>
                                        <span className="text-slate-900 font-medium">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total_amount || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-500 text-sm">Tax estimate (0%)</span>
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
                        ) : (
                            // Copilot Tab
                            <div className="h-full">
                                <InvoiceCopilot
                                    invoiceNumber={invoice.invoice_number}
                                    vendorName={invoice.vendor_name_extracted}
                                    status={invoice.status}
                                    exceptionReason={invoice.exception_reason}
                                />
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

function MatchingRow({ line, invoiceStatus }: { line: POLine, invoiceStatus: string }) {
    const hasPriceVariance = invoiceStatus === 'BLOCKED_PRICE';
    const hasQtyVariance = invoiceStatus === 'BLOCKED_QTY';

    return (
        <div className="bg-white border hover:border-blue-300 rounded-lg p-4 shadow-sm relative overflow-hidden group transition-all">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-mono text-slate-400">Line {line.line_item}</span>
                    <h4 className="font-medium text-slate-900">{line.material}</h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">
                    Matched
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
                <div className={cn("p-2 rounded border transition-colors", hasQtyVariance ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100")}>
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Package size={12} /> Quantity</div>
                    <div className="font-semibold text-slate-700">{line.ordered_qty} <span className="text-xs font-normal text-slate-400">Ordered</span></div>
                    {hasQtyVariance && <div className="text-[10px] text-red-600 font-medium mt-1">+1 Variance Detected</div>}
                </div>
                <div className={cn("p-2 rounded border transition-colors", hasPriceVariance ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100")}>
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><DollarSign size={12} /> Unit Price</div>
                    <div className="font-semibold text-slate-700">${line.unit_price} <span className="text-xs font-normal text-slate-400">/unit</span></div>
                    {hasPriceVariance && <div className="text-[10px] text-red-600 font-medium mt-1">Price Mismatch (+$10)</div>}
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
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent/10 shadow-sm", styles[status] || 'bg-gray-100 text-gray-800')}>
            {status.replace(/_/g, ' ')}
        </span>
    )
}
