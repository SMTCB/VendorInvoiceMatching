"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
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
    audit_trail: string | null
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

    const [loading, setLoading] = useState(false);

    const handleSendInquiry = async () => {
        if (!inquiryNote.trim()) {
            alert('Please enter a note for the vendor before sending an inquiry.');
            return;
        }
        if (!window.confirm('Send inquiry email to vendor?')) return;

        setLoading(true);
        try {
            const webhookUrl = process.env.NEXT_PUBLIC_N8N_INQUIRY_WEBHOOK_URL;
            if (!webhookUrl) throw new Error('Inquiry webhook URL not configured');

            const response = await fetch(webhookUrl, {
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
                router.refresh();
            } else {
                const errData = await response.text();
                console.error('N8N Error:', errData);
                alert('Failed to trigger inquiry workflow. Please check N8N status.');
            }
        } catch (e) {
            console.error('Inquiry Error:', e);
            alert('Error connecting to inquiry service.');
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async () => {
        if (!window.confirm('Post this invoice for final payment?')) return;
        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('invoices')
                .update({ status: 'POSTED' })
                .eq('id', invoice.id);

            if (error) throw error;
            alert('Invoice POSTED successfully. It will now be archived in the Document Hub.');
            router.push('/'); // Redirect to dashboard
            router.refresh();
        } catch (e) {
            console.error('Error posting invoice:', e);
            alert('Failed to post invoice.');
        } finally {
            setLoading(false);
        }
    };

    const handlePark = async () => {
        const isCurrentlyParked = invoice.status === 'PARKED';
        const confirmMsg = isCurrentlyParked
            ? 'Release this invoice from Parked status and return to Processing?'
            : 'Are you sure you want to PARK this invoice?';

        if (!window.confirm(confirmMsg)) return;
        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('invoices')
                .update({ status: isCurrentlyParked ? 'PROCESSING' : 'PARKED' })
                .eq('id', invoice.id);

            if (error) throw error;
            alert(`Invoice ${isCurrentlyParked ? 'RELEASED' : 'PARKED'} successfully.`);
            router.refresh();
        } catch (e) {
            console.error('Error toggling park status:', e);
            alert('Failed to update invoice status.');
        } finally {
            setLoading(false);
        }
    };
    const handleTrainAI = async () => {
        if (!inquiryNote.trim()) {
            alert('Please explain the rationale in the memo field before training the AI.');
            return;
        }
        if (!window.confirm('Add this scenario to AI Training data and create a new Rule?')) return;

        setLoading(true);
        try {
            const supabase = createClient();

            // 1. Add to Learning Examples
            const { error: learningError } = await supabase
                .from('ai_learning_examples')
                .insert({
                    invoice_id: invoice.id,
                    vendor_name: invoice.vendor_name_extracted,
                    scenario_description: invoice.exception_reason || 'Manual classification',
                    user_rationale: inquiryNote,
                    expected_status: 'READY_TO_POST'
                });

            if (learningError) throw learningError;

            // 2. Proactively create a rule if applicable (POC simple rule)
            await supabase
                .from('validator_rules')
                .insert({
                    name: `Override: ${invoice.vendor_name_extracted}`,
                    condition_field: 'vendor_name',
                    operator: 'equals',
                    value: invoice.vendor_name_extracted,
                    action: 'auto_approve',
                    is_active: true
                });

            alert('AI training sample submitted and Rule created successfully.');
            setInquiryNote('');
        } catch (e) {
            console.error('Error training AI:', e);
            alert('Failed to save learning example.');
        } finally {
            setLoading(false);
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
                        onClick={handlePark}
                        disabled={loading}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm disabled:opacity-50"
                    >
                        {invoice.status === 'PARKED' ? 'Release' : 'Park'}
                    </button>
                    <button
                        disabled={loading || invoice.status === 'POSTED'}
                        className="bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-brand-blue/30 flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                        onClick={handlePost}
                    >
                        <CheckCircle size={14} className="text-brand-cyan" />
                        {loading ? 'POSTING...' : 'POST INVOICE'}
                    </button>
                </div>
            </header>


            {/* Main Content Split */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Panel: Document Hub */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl flex-1 flex flex-col min-h-[600px] relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <FileText size={12} className="text-brand-cyan" /> DOCUMENT SOURCE ARTIFACT
                        </span>
                        {invoice.pdf_link && (
                            <a href={invoice.pdf_link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-brand-cyan hover:underline flex items-center gap-1">
                                FULL VIEW <ExternalLink size={10} />
                            </a>
                        )}
                    </div>
                    {isProcessing ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-slate-700 border-t-brand-cyan animate-spin" />
                                <Zap size={32} className="absolute inset-0 m-auto text-brand-cyan animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Gemini Extracting Data</h3>
                                <p className="text-sm text-slate-400 mt-2">Running OCR and identifying line items...</p>
                            </div>
                        </div>
                    ) : (invoice.pdf_link && invoice.pdf_link.startsWith('http')) ? (
                        <div className="relative w-full h-full group/pdf">
                            <iframe
                                src={invoice.pdf_link}
                                className="w-full h-full border-none rounded-xl"
                                title="Invoice PDF"
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                            <FileText size={48} className="mb-4 opacity-20" />
                            <div className="font-bold">Preview Restricted</div>
                            <p className="text-xs mt-2 opacity-50 max-w-[200px] text-center">Chrome policy may block GDrive embeds. Click 'Full View' above.</p>
                        </div>
                    )}

                    {/* Visual scan animation effect */}
                    {isProcessing && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent translate-y-[-100%] animate-scan" />}
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
                                {invoice.status !== 'POSTED' && (
                                    <div className={cn(
                                        "p-8 border-b",
                                        invoice.status === 'READY_TO_POST' ? "bg-emerald-50/50 border-emerald-100" : "bg-amber-50/50 border-amber-100"
                                    )}>
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "p-2.5 rounded-xl border shadow-sm",
                                                invoice.status === 'READY_TO_POST' ? "bg-emerald-100 border-emerald-200 text-emerald-600" : "bg-amber-100 border-amber-200 text-amber-600"
                                            )}>
                                                {invoice.status === 'READY_TO_POST' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={cn(
                                                    "font-bold text-sm tracking-tight",
                                                    invoice.status === 'READY_TO_POST' ? "text-emerald-900" : "text-amber-900"
                                                )}>
                                                    {invoice.status === 'READY_TO_POST' ? 'Perfect Match Verified' : 'Action Required: Discrepancy Found'}
                                                </h3>
                                                <p className={cn(
                                                    "text-sm mt-1 leading-relaxed",
                                                    invoice.status === 'READY_TO_POST' ? "text-emerald-800" : "text-amber-800"
                                                )}>
                                                    {invoice.exception_reason || (isProcessing ? 'System is calculating variances...' : 'Awaiting manual verification of extracted lines.')}
                                                </p>

                                                {!isProcessing && invoice.audit_trail && (
                                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {invoice.audit_trail.split(';').map((step, idx) => {
                                                            const parts = step.split(':');
                                                            const label = parts[0]?.trim() || 'Step';
                                                            const content = parts[1]?.trim() || '';
                                                            if (!content) return null;
                                                            const isPass = content.toLowerCase().includes('match') || content.toLowerCase().includes('found') || content.toLowerCase().includes('valid') || content.toLowerCase().includes('verified');

                                                            return (
                                                                <div key={idx} className="bg-white/50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "p-1 rounded-full",
                                                                        isPass ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                                                                    )}>
                                                                        {isPass ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                                    </div>
                                                                    <div className="overflow-hidden">
                                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label.replace('[', '').replace(']', '')}</div>
                                                                        <div className="text-[11px] font-bold text-slate-700 truncate">{content}</div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {!isProcessing && invoice.status !== 'READY_TO_POST' && (
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
                                                                disabled={loading}
                                                                className="text-[10px] bg-brand-navy hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-black uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50"
                                                            >
                                                                Send Vendor Inquiry
                                                            </button>
                                                            <button
                                                                onClick={handleTrainAI}
                                                                disabled={loading}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy/5 hover:bg-brand-navy/10 text-brand-navy text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-brand-navy/5 disabled:opacity-50"
                                                            >
                                                                <Zap size={12} className="text-brand-yellow fill-brand-yellow" />
                                                                Train AI on this Match
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
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
                                                poLines.map((line, idx) => {
                                                    // Try to find a matching extracted line item (POC: by index or description)
                                                    const extractedLine = (invoice as any).line_items?.[idx] || (invoice as any).line_items?.find((l: any) => l.description?.includes(line.material));

                                                    return (
                                                        <MatchingRow
                                                            key={line.id}
                                                            line={line}
                                                            extractedLine={extractedLine}
                                                            invoiceStatus={invoice.status}
                                                        />
                                                    );
                                                })
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
    );
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

function MatchingRow({ line, extractedLine, invoiceStatus }: { line: POLine, extractedLine: any, invoiceStatus: string }) {
    const hasPriceVariance = invoiceStatus === 'BLOCKED_PRICE' || (extractedLine && extractedLine.unit_price != line.unit_price);
    const hasQtyVariance = invoiceStatus === 'BLOCKED_QTY' || (extractedLine && extractedLine.quantity != line.ordered_qty);

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-brand-blue/5 hover:border-brand-blue/20 transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div className="max-w-[70%]">
                    <span className="text-[10px] font-black text-brand-blue/50 uppercase tracking-widest block mb-1">ERPLINE_{line.line_item} / INV_DESC: {extractedLine?.description || '---'}</span>
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
                    label="Quantity Mapping"
                    value={`SAP: ${line.ordered_qty}`}
                    alert={hasQtyVariance}
                    alertText={extractedLine ? `EXTRACTED: ${extractedLine.quantity}` : "NO DATA"}
                />
                <MetricBox
                    icon={<DollarSign size={12} />}
                    label="Price Mapping"
                    value={`SAP: $${line.unit_price}`}
                    alert={hasPriceVariance}
                    alertText={extractedLine ? `EXTRACTED: $${extractedLine.unit_price}` : "NO DATA"}
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
        BLOCKED_PRICE: 'bg-amber-500/20 text-amber-500 border-amber-500/10',
        BLOCKED_QTY: 'bg-orange-500/20 text-orange-400 border-orange-500/10',
        BLOCKED_DATA: 'bg-rose-500/20 text-rose-500 border-rose-500/10',
        BLOCKED_DUPLICATE: 'bg-slate-500/20 text-slate-300 border-slate-500/10',
        PARKED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/10',
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
