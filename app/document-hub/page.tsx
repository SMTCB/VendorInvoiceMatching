import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
    CheckCircle,
    AlertCircle,
    Clock,
    Search,
    Filter,
    ArrowUpRight,
    Briefcase,
    Layers,
    Zap,
    ChevronLeft,
    ChevronRight,
    FileText
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DocumentHub() {
    const supabase = await createClient()

    // Fetch ALL invoices (including posted/rejected)
    let { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

    // Calculate generic stats for the hub
    const totalInvoices = invoices?.length || 0;
    const posted = invoices?.filter(i => i.status === 'POSTED').length || 0;
    const rejected = invoices?.filter(i => i.status === 'REJECTED').length || 0;
    const processing = invoices?.filter(i => i.status === 'PROCESSING').length || 0;

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 sticky top-0 z-20 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">Document Hub</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] opacity-70 mt-1">Central Archive for all Invoices</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">
                        {totalInvoices} Total Records
                    </div>
                </div>
            </header>

            <div className="p-8 max-w-7xl mx-auto w-full space-y-8">

                {/* Status Breakdown Mini-Hero */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatusCounter label="Processing" count={processing} color="text-indigo-600" bg="bg-indigo-50" />
                    <StatusCounter label="Posted" count={posted} color="text-emerald-600" bg="bg-emerald-50" />
                    <StatusCounter label="Rejected" count={rejected} color="text-red-600" bg="bg-red-50" />
                    <StatusCounter label="Total Archive" count={totalInvoices} color="text-slate-600" bg="bg-slate-100" />
                </div>

                {/* Main List Table */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col">

                    <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/10">
                        <div className="relative min-w-[400px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search archive..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                <Filter size={14} /> All Statuses
                            </button>
                            <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto text-[13px]">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-3 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Document Status</th>
                                    <th className="px-8 py-3 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Vendor Reference</th>
                                    <th className="px-8 py-3 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Financial Data</th>
                                    <th className="px-8 py-3 text-right font-bold text-slate-400 uppercase tracking-widest text-[10px]">Total (USD)</th>
                                    <th className="px-8 py-3 text-right font-bold text-slate-400 uppercase tracking-widest text-[10px]">Archived Date</th>
                                    <th className="px-8 py-3 text-right font-bold text-slate-400 uppercase tracking-widest text-[10px]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-50">
                                {invoices?.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                                            Zero records found in archive.
                                        </td>
                                    </tr>
                                ) : (
                                    invoices?.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <StatusBadge status={invoice.status} />
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="font-bold text-slate-900">{invoice.vendor_name_extracted || 'Unknown'}</div>
                                                <div className="text-[10px] text-slate-400">ID: {invoice.vendor_id || 'N/A'}</div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="font-bold text-slate-800">{invoice.invoice_number || '---'}</div>
                                                <div className="text-[10px] text-slate-400">PO: {invoice.po_reference || '---'}</div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right font-black text-slate-900 tabular-nums">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(invoice.total_amount) || 0)}
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right text-slate-500 tabular-nums">
                                                {new Date(invoice.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                                <Link
                                                    href={`/invoices/${invoice.id}`}
                                                    className="text-brand-blue hover:text-brand-navy font-bold flex items-center gap-1 justify-end transition-colors"
                                                >
                                                    View <ArrowUpRight size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {invoices?.length} results</span>
                        <div className="flex gap-1">
                            <button className="p-2 bg-white border rounded-lg text-slate-300"><ChevronLeft size={16} /></button>
                            <button className="p-2 bg-white border rounded-lg text-slate-600"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatusCounter({ label, count, color, bg }: { label: string, count: number, color: string, bg: string }) {
    return (
        <div className={cn("p-6 rounded-2xl border border-slate-100 flex items-center justify-between bg-white shadow-sm hover:shadow-md transition-shadow")}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
                <span className={cn("text-2xl font-black tabular-nums", color)}>{count}</span>
            </div>
            <div className={cn("h-10 w-10 flex items-center justify-center rounded-xl", bg, color)}>
                <Layers size={20} />
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-indigo-100/20',
        READY_TO_POST: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/20',
        BLOCKED_PRICE: 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-100/20',
        BLOCKED_QTY: 'bg-orange-50 text-orange-700 border-orange-100 shadow-orange-100/20',
        POSTED: 'bg-slate-100 text-slate-600 border-slate-200',
        REJECTED: 'bg-red-50 text-red-700 border-red-100 shadow-red-100/20',
        AWAITING_INFO: 'bg-purple-50 text-purple-700 border-purple-100 shadow-purple-100/20'
    }

    return (
        <span className={cn(
            "px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-wider",
            styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
        )}>
            {status.replace(/_/g, ' ')}
        </span>
    )
}
