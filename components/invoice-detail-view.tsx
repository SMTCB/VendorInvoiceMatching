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
            ? 'Release this invoice from Parked status?'
            : 'Are you sure you want to PARK this invoice for later review?';

        if (!window.confirm(confirmMsg)) return;
        setLoading(true);
        try {
            const supabase = createClient();
            // If releasing, we don't know the exact previous status, but usually it was AWAITING_INFO or BLOCKED.
            // Setting to AWAITING_INFO is a safe fallback for review.
            const nextStatus = isCurrentlyParked ? 'AWAITING_INFO' : 'PARKED';

            const { error } = await supabase
                .from('invoices')
                .update({ status: nextStatus })
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
                        className={cn(
                            "px-5 py-2 rounded-xl text-xs font-black transition-all shadow-sm disabled:opacity-50 border uppercase tracking-widest",
                            invoice.status === 'PARKED'
                                ? "bg-cyan-100 border-cyan-200 text-cyan-700 hover:bg-cyan-200 shadow-cyan-100"
                                : "bg-white/10 border-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                        )}
                    >
                        {invoice.status === 'PARKED' ? 'Release Invoice' : 'Park Invoice'}
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
                <div className="w-[45%] bg-slate-900 border-r border-white/10 flex flex-col relative group">
                    <div className="bg-slate-800/50 px-6 py-3 flex items-center justify-between border-b border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <FileText size={12} className="text-brand-cyan" /> DOCUMENT SOURCE ARTIFACT
                        </span>
                        {invoice.pdf_link && (
                            <a
                                href={invoice.pdf_link.replace('/preview', '/view')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-brand-cyan hover:underline flex items-center gap-1"
                            >
                                FULL VIEW <ExternalLink size={10} />
                            </a>
                        )}
                    </div>

                    <div className="flex-1 overflow-hidden p-6 flex flex-col">
                        <div className="flex-1 bg-slate-800 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col h-full">
                            {isProcessing ? (
                                <div className="flex-1 flex flex-col items-center justify-center space-y-6 px-12">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-4 border-slate-700 border-t-brand-cyan animate-spin" />
                                        <Zap size={32} className="absolute inset-0 m-auto text-brand-cyan animate-pulse" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Gemini Intelligence Active</h3>
                                        <p className="text-sm text-slate-400 mt-2 font-medium">Extracting line items and verifying against ERP data...</p>
                                    </div>
                                </div>
                            ) : (invoice.pdf_link && (invoice.pdf_link.includes('http') || invoice.pdf_link.includes('drive.google.com'))) ? (
                                <iframe
                                    src={invoice.pdf_link.includes('drive.google.com')
                                        ? (invoice.pdf_link.includes('/preview')
                                            ? invoice.pdf_link
                                            : invoice.pdf_link.replace(/\/(view|edit|open).*/, '/preview')
                                        )
                                        : invoice.pdf_link
                                    }
                                    className="w-full h-full border-none bg-slate-800"
                                    title="Invoice PDF"
                                />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-12 text-center text-slate-300 font-sans">
                                    <FileText size={48} className="mb-4 opacity-20 text-brand-cyan" />
                                    <div className="font-bold text-white uppercase tracking-widest text-[10px]">Preview Unavailable</div>
                                    <p className="text-[10px] mt-2 opacity-50 max-w-[200px] font-bold uppercase tracking-tighter leading-relaxed">The document source might be restricted or pending sync.</p>
                                </div>
                            )}

                            {/* Visual scan animation effect */}
                            {isProcessing && <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-cyan shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10 animate-scan" />}
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
                                                            let label = parts[0]?.trim() || 'Step';
                                                            let content = parts[1]?.trim() || '';
                                                            if (!content) return null;

                                                            // Plain English translation mapping
                                                            const labels: Record<string, string> = {
                                                                '[NODE]': 'Processing Step',
                                                                '[DUPE_CHECK]': 'Duplicate Detection',
                                                                '[RULE_0]': 'Critical Data Validation',
                                                                '[RULE_1]': 'Unordered Costs Verify',
                                                                '[CURRENCY_CHECK]': 'Currency Alignment',
                                                                '[PRICE_CHECK]': 'Unit Price Audit',
                                                                '[QTY_CHECK]': 'Quantity Audit',
                                                                '[RULE_MATCH]': 'Strategic Rule Match'
                                                            };

                                                            const cleanLabel = labels[label.toUpperCase()] || label.replace(/[\[\]]/g, '');
                                                            const isPass = content.toLowerCase().includes('match') ||
                                                                content.toLowerCase().includes('found') ||
                                                                content.toLowerCase().includes('valid') ||
                                                                content.toLowerCase().includes('verified') ||
                                                                content.toLowerCase().includes('success') ||
                                                                content.toLowerCase().includes('passed');

                                                            return (
                                                                <div key={idx} className="bg-white/80 border border-slate-100 rounded-[1.25rem] p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                                                    <div className={cn(
                                                                        "p-2 rounded-xl shadow-inner",
                                                                        isPass ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                                    )}>
                                                                        {isPass ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                                                    </div>
                                                                    <div className="overflow-hidden">
                                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{cleanLabel}</div>
                                                                        <div className="text-xs font-bold text-slate-700 truncate">{content}</div>
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
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">3-Way Match Verification</h3>
                                            <p className="text-xs text-slate-400 font-medium">Auto-cross-reference: Invoice v. PO v. Goods Receipt</p>
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
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
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
    const hasPriceVariance = invoiceStatus === 'BLOCKED_PRICE' || (extractedLine && Number(extractedLine.unit_price) != Number(line.unit_price));
    const hasQtyVariance = invoiceStatus === 'BLOCKED_QTY' || (extractedLine && Number(extractedLine.quantity) != Number(line.ordered_qty));

    // Mock GR data for premium 3-way match visualization (based on PO unless specific blocked status)
    const grQty = invoiceStatus === 'READY_TO_POST' ? line.ordered_qty : (invoiceStatus === 'BLOCKED_QTY' ? 0 : line.ordered_qty);

    return (
        <div className="bg-white border border-slate-100 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:shadow-brand-blue/5 hover:border-brand-blue/20 transition-all duration-500 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
                <div className="max-w-[70%]">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black text-brand-blue bg-brand-blue/5 px-2 py-0.5 rounded-full uppercase tracking-widest">Line Item {line.line_item}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{extractedLine?.description || 'Extracted Description Matching...'}</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-brand-blue transition-colors uppercase">{line.material}</h4>
                </div>
                <div className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 shadow-sm transition-all duration-300",
                    (hasPriceVariance || hasQtyVariance) ? "bg-rose-50 text-rose-700 border-rose-100 shadow-rose-100/20" : "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/20"
                )}>
                    {(hasPriceVariance || hasQtyVariance) ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
                    {(hasPriceVariance || hasQtyVariance) ? "Discrepancy" : "Verified Match"}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 3-WAY QUANTITY MATCH */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <Package size={12} className="text-brand-blue" /> Quantity Match Audit
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <SimpleMetric label="PO Order" value={line.ordered_qty} />
                        <SimpleMetric label="Invoice" value={extractedLine?.quantity || '---'} alert={hasQtyVariance} />
                        <SimpleMetric label="GR (Receipt)" value={grQty} success={invoiceStatus === 'READY_TO_POST'} />
                    </div>
                </div>

                {/* PRICE MATCH */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <DollarSign size={12} className="text-emerald-500" /> Unit Price Audit
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <SimpleMetric label="SAP Price" value={`$${line.unit_price}`} />
                        <SimpleMetric label="Inv. Price" value={extractedLine?.unit_price ? `$${extractedLine.unit_price}` : '---'} alert={hasPriceVariance} />
                    </div>
                </div>
            </div>

            {/* Premium background decoration */}
            <div className="absolute right-0 bottom-0 p-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <CheckCircle size={80} strokeWidth={1} />
            </div>
            <div className="absolute left-0 top-0 w-1.5 h-full bg-slate-50 group-hover:bg-brand-blue transition-colors" />
        </div>
    )
}

function SimpleMetric({ label, value, alert, success }: { label: string, value: string | number, alert?: boolean, success?: boolean }) {
    return (
        <div className={cn(
            "p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all duration-300",
            alert ? "bg-rose-50 border-rose-100 ring-1 ring-rose-100 shadow-sm" :
                success ? "bg-emerald-50 border-emerald-100" :
                    "bg-slate-50 border-slate-100"
        )}>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter text-center">{label}</span>
            <span className={cn(
                "text-sm font-black tracking-tighter",
                alert ? "text-rose-700" : success ? "text-emerald-700" : "text-slate-900"
            )}>{value}</span>
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
