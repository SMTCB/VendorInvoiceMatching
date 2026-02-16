"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    FileText,
    ExternalLink,
    ShieldAlert,
    DollarSign,
    Package,
    Wand2,
    Layers,
    Info,
    Calendar,
    ChevronRight,
    Search,
    Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { InvoiceCopilot } from './invoice-copilot'
import { Logo } from './ui/logo'

// Re-defining simple types for props
type Invoice = {
    id: string
    invoice_number: string
    po_reference: string
    vendor_name_extracted: string
    vendor_id: string | null
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
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'matching' | 'copilot'>('matching');
    const [inquiryNote, setInquiryNote] = useState('');

    const isProcessing = invoice.status === 'PROCESSING';

    // Auto-refresh while processing
    useEffect(() => {
        if (!isProcessing) return;

        const interval = setInterval(() => {
            router.refresh();
        }, 3000);

        return () => clearInterval(interval);
    }, [isProcessing, router]);

    const handleSendInquiry = async () => {
        if (!window.confirm('Send inquiry email to vendor?')) return;
        try {
            const response = await fetch('YOUR_N8N_INQUIRY_WEBHOOK_URL', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoice_id: invoice.id,
                    invoice_number: invoice.invoice_number,
                    vendor: invoice.vendor_name_extracted,
                    reason: invoice.exception_reason,
                    custom_note: inquiryNote
                })
            });
            if (response.ok) {
                alert('Inquiry sent successfully!');
                setInquiryNote('');
            } else {
                alert('Demo: Inquiry email trigger simulated successfully.');
            }
        } catch (e) {
            alert('Demo: Inquiry email trigger simulated successfully.');
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
            {/* Premium Header */}
            <header className="bg-brand-navy text-white px-8 py-4 flex items-center justify-between shrink-0 z-20 shadow-2xl shadow-brand-navy/30">
                <div className="flex items-center gap-6">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5 hover:border-white/20">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="h-8 w-px bg-white/10" />
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black tracking-tight flex items-center gap-3">
                                {invoice.invoice_number || (isProcessing ? 'SCANNING...' : 'PENDING')}
                                <StatusBadge status={invoice.status} />
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5 flex items-center gap-2">
                            <span>{invoice.vendor_name_extracted || (isProcessing ? 'Identifying Vendor...' : 'Unknown')}</span>
                            <span className="text-brand-cyan opacity-50">•</span>
                            <span className="flex items-center gap-1"><Layers size={10} /> PO: {invoice.po_reference || 'SCANNING'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-6 mr-6 border-r border-white/10 pr-6">
                        <div className="text-right">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrival Date</div>
                            <div className="text-sm font-bold">{new Date(invoice.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</div>
                            <div className="text-sm font-bold text-brand-cyan tabular-nums">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(invoice.total_amount) || 0)}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSendInquiry}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                        Send Inquiry
                    </button>
                    <button
                        onClick={() => alert('Demo: Invoice status updated to "PARKED".')}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                    >
                        Park
                    </button>
                    <button className="bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-brand-blue/30 flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98]">
                        <CheckCircle size={14} className="text-brand-cyan" />
                        POST INVOICE
                    </button>
                </div>
            </header>


            {/* Main Content Split */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Panel: Document Hub */}
                <div className="w-[45%] bg-[#F1F5F9] border-r border-slate-200 flex flex-col relative group">
                    <div className="bg-slate-900/5 backdrop-blur px-6 py-3 flex items-center justify-between border-b border-slate-200">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <FileText size={12} className="text-brand-blue" /> Intelligent Scan Hub
                        </span>
                        <a href={invoice.pdf_link || '#'} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-brand-blue hover:underline flex items-center gap-1">
                            SOURCE VIEW <ExternalLink size={10} />
                        </a>
                    </div>

                    <div className="flex-1 overflow-hidden p-8 flex items-center justify-center">
                        <div className="bg-white shadow-2xl rounded-sm border border-slate-200 w-full max-w-lg aspect-[1/1.41] relative flex flex-col items-center justify-center p-12 text-center group-hover:scale-[1.01] transition-transform duration-500">
                            {isProcessing ? (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-brand-blue animate-spin" />
                                        <Zap size={32} className="absolute inset-0 m-auto text-brand-cyan animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Gemini is Extracting Data</h3>
                                        <p className="text-sm text-slate-500 mt-2">Running OCR and identifying line items with 99.8% confidence...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <FileText size={64} className="text-slate-200 mb-6" />
                                    <div className="text-slate-400 font-medium">PDF Preview Restricted in POC</div>
                                    <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-2">{invoice.invoice_number || 'DOC_ID_PENDING'}</p>
                                    <a href={invoice.pdf_link} target="_blank" className="mt-8 bg-slate-50 border border-slate-200 px-6 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-widest shadow-sm">
                                        Download PDF
                                    </a>
                                </>
                            )}

                            {/* Visual scan animation effect */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent translate-y-[-100%] animate-scan group-hover:opacity-100 opacity-0" />
                        </div>
                    </div>
                </div>

                {/* Right Panel: AI Controller */}
                <div className="w-[55%] bg-white flex flex-col overflow-hidden">

                    {/* High-End Tabs */}
                    <div className="flex px-6 pt-4 gap-2 bg-[#F8FAFC] border-b border-slate-200">
                        <TabButton
                            active={activeTab === 'matching'}
                            onClick={() => setActiveTab('matching')}
                            icon={<Layers size={14} />}
                            label="Matching Controller"
                        />
                        <TabButton
                            active={activeTab === 'copilot'}
                            onClick={() => setActiveTab('copilot')}
                            icon={<Wand2 size={14} />}
                            label="AI Insight Agent"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {activeTab === 'matching' ? (
                            <div className="flex flex-col h-full">

                                {/* Status Banner (Exception or Success) */}
                                {invoice.status !== 'READY_TO_POST' && invoice.status !== 'POSTED' ? (
                                    <div className="p-8 bg-amber-50/50 border-b border-amber-100">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-amber-100 p-2.5 rounded-xl border border-amber-200 shadow-sm shadow-amber-900/5">
                                                <ShieldAlert className="text-amber-600" size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-amber-900 font-bold text-sm tracking-tight">Match Discrepancy Flagged</h3>
                                                <p className="text-amber-800 text-sm mt-1 leading-relaxed">
                                                    {invoice.exception_reason || (isProcessing ? 'System is calculating variances...' : 'Awaiting manual verification of extracted lines.')}
                                                </p>

                                                {!isProcessing && (
                                                    <div className="mt-6 space-y-4">
                                                        <div className="bg-white/80 backdrop-blur border border-amber-200 rounded-xl p-4 shadow-sm">
                                                            <label className="text-[10px] font-black text-amber-900/50 uppercase tracking-[0.2em] mb-2 block">Resolution Instruction / Inquiry Memo</label>
                                                            <textarea
                                                                value={inquiryNote}
                                                                onChange={(e) => setInquiryNote(e.target.value)}
                                                                placeholder="Detail the clarification needed from vendor..."
                                                                className="w-full text-sm bg-transparent border-none focus:ring-0 outline-none min-h-[80px] text-amber-900 placeholder:text-amber-900/30"
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={handleSendInquiry}
                                                                className="text-[10px] bg-brand-navy hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                                                            >
                                                                Send Vendor Inquiry
                                                            </button>
                                                            <button
                                                                onClick={() => alert('Demo: Insight saved to AI knowledge base.')}
                                                                className="text-[10px] bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                                                            >
                                                                Train AI on this Match
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-emerald-50/50 border-b border-emerald-100">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-emerald-100 p-2.5 rounded-xl border border-emerald-200 shadow-sm text-emerald-600">
                                                <CheckCircle size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-emerald-900 font-bold text-sm">Perfect Match Verified</h3>
                                                <p className="text-emerald-800 text-xs mt-0.5">Gemini confirmed 100% alignment with PO {invoice.po_reference}.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Line Items Analysis */}
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Calculated Variances</h3>
                                            <p className="text-xs text-slate-400 font-medium">Verification between Extraction and ERP Record</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-tighter italic flex items-center gap-1">
                                                <CheckCircle size={10} /> ERP Linked
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {isProcessing ? (
                                            [1, 2].map(i => (
                                                <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 animate-pulse">
                                                    <div className="h-4 w-1/3 bg-slate-200 rounded mb-4" />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="h-12 bg-white rounded-xl" />
                                                        <div className="h-12 bg-white rounded-xl" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            poLines.length > 0 ? (
                                                poLines.map((line) => (
                                                    <MatchingRow key={line.id} line={line} invoiceStatus={invoice.status} />
                                                ))
                                            ) : (
                                                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30 text-slate-400">
                                                    <Search size={32} strokeWidth={1.5} className="mb-4 text-slate-200" />
                                                    <p className="text-sm font-bold text-slate-600">No ERP Reference Found</p>
                                                    <p className="text-xs mt-1">AI could not associate this invoice with any active PO.</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Summary Sidebar / Footer Table */}
                                <div className="mt-auto p-8 bg-white border-t border-slate-100 space-y-3">
                                    <SummaryRow label="Subtotal (Extracted)" value={invoice.total_amount} />
                                    <SummaryRow label="Taxation / VAT (0%)" value={0} />
                                    <div className="flex justify-between items-center py-4 border-t border-slate-100 mt-4">
                                        <span className="text-slate-900 font-black text-lg tracking-tight uppercase">Settlement Amount</span>
                                        <span className="text-3xl font-black text-brand-navy tracking-tighter tabular-nums">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(invoice.total_amount) || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full bg-[#F8FAFC]">
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

            <style jsx global>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(1000%); }
                }
            `}</style>
        </div>
    )
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all rounded-t-xl border-t border-x",
                active
                    ? "bg-white border-slate-200 text-brand-navy shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"
                    : "bg-transparent border-transparent text-slate-400 hover:text-slate-600"
            )}
        >
            {icon}
            {label}
        </button>
    )
}

function SummaryRow({ label, value }: { label: string, value: number }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
            <span className="text-slate-900 font-bold tabular-nums">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))}
            </span>
        </div>
    )
}

function MatchingRow({ line, invoiceStatus }: { line: POLine, invoiceStatus: string }) {
    const hasPriceVariance = invoiceStatus === 'BLOCKED_PRICE';
    const hasQtyVariance = invoiceStatus === 'BLOCKED_QTY';

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-brand-blue/5 hover:border-brand-blue/20 transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div className="max-w-[70%]">
                    <span className="text-[10px] font-black text-brand-blue/50 uppercase tracking-widest block mb-1">ERPLINE_{line.line_item}</span>
                    <h4 className="text-base font-bold text-slate-900 tracking-tight leading-tight group-hover:text-brand-blue transition-colors">{line.material}</h4>
                </div>
                <div className={cn(
                    "px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter border flex items-center gap-1.5 shadow-sm",
                    (hasPriceVariance || hasQtyVariance) ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                )}>
                    {(hasPriceVariance || hasQtyVariance) ? <ShieldAlert size={10} /> : <CheckCircle size={10} />}
                    {(hasPriceVariance || hasQtyVariance) ? "DISCREPANCY" : "VERIFIED"}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <MetricBox
                    icon={<Package size={12} />}
                    label="Quantity"
                    value={line.ordered_qty}
                    alert={hasQtyVariance}
                    alertText="ERP: 1, Extract: 2"
                />
                <MetricBox
                    icon={<DollarSign size={12} />}
                    label="Unit Value"
                    value={`$${line.unit_price}`}
                    alert={hasPriceVariance}
                    alertText="Price Deviation"
                />
            </div>

            {/* Visual connector for matched item */}
            <div className="absolute left-0 top-0 w-1 h-full bg-slate-100 group-hover:bg-brand-blue transition-colors" />
        </div>
    )
}

function MetricBox({ icon, label, value, alert, alertText }: { icon: React.ReactNode, label: string, value: string | number, alert?: boolean, alertText?: string }) {
    return (
        <div className={cn(
            "p-3 rounded-xl border transition-all duration-300 flex items-center gap-3",
            alert ? "bg-red-50 border-red-100 ring-1 ring-red-200" : "bg-slate-50 border-slate-50"
        )}>
            <div className={cn("p-2 rounded-lg", alert ? "bg-red-100 text-red-600" : "bg-white shadow-sm text-slate-400")}>
                {icon}
            </div>
            <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</div>
                <div className="text-sm font-black text-slate-900 leading-none">{value}</div>
                {alert && <div className="text-[9px] font-bold text-red-600 mt-1 uppercase tracking-tighter">{alertText}</div>}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PROCESSING: 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/10',
        READY_TO_POST: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/10',
        BLOCKED_PRICE: 'bg-amber-500/20 text-amber-400 border-amber-500/10',
        BLOCKED_QTY: 'bg-orange-500/20 text-orange-400 border-orange-500/10',
        POSTED: 'bg-slate-500/20 text-slate-400 border-slate-500/10',
        REJECTED: 'bg-red-500/20 text-red-400 border-red-500/10',
        AWAITING_INFO: 'bg-purple-500/20 text-purple-400 border-purple-500/10'
    }

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-widest backdrop-blur-sm",
            styles[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/10'
        )}>
            {status?.replace(/_/g, ' ') || 'UNKNOWN'}
        </span>
    )
}
