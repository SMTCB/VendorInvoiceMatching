'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    Search,
    Filter,
    ArrowUpRight,
    Briefcase,
    Clock,
    CheckCircle,
    AlertCircle,
    Layers,
    X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Invoice {
    id: string
    status: string
    vendor_name_extracted: string
    vendor_id: string | null
    invoice_number: string | null
    po_reference: string | null
    total_amount: number
    created_at: string
}

interface InvoiceListProps {
    invoices: Invoice[]
}

export function InvoiceList({ invoices }: InvoiceListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string | null>(null)
    const [showFilters, setShowFilters] = useState(false)

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const matchesSearch =
                (invoice.vendor_name_extracted?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (invoice.invoice_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (invoice.po_reference?.toLowerCase() || '').includes(searchTerm.toLowerCase())

            const matchesStatus = !statusFilter || invoice.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [invoices, searchTerm, statusFilter])

    const statuses = Array.from(new Set(invoices.map(i => i.status)))

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col">
            {/* List Header / Filter Bar */}
            <div className="p-6 border-b border-slate-100 flex flex-col gap-4 bg-slate-50/30">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-slate-900">Incoming Payables</h3>
                        <div className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ring-1 ring-indigo-100 italic flex items-center gap-1">
                            AI Enhanced
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search vendor Name, PO or Invoice Nr..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-all shadow-sm",
                                showFilters || statusFilter
                                    ? "bg-brand-blue text-white border-brand-blue"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            )}
                        >
                            <Filter size={14} /> {statusFilter ? statusFilter.replace(/_/g, ' ') : 'Filters'}
                            {(statusFilter || searchTerm) && (
                                <X
                                    size={14}
                                    className="ml-1 hover:scale-110"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSearchTerm('')
                                        setStatusFilter(null)
                                    }}
                                />
                            )}
                        </button>
                    </div>
                </div>

                {/* Quick Status Filters */}
                {showFilters && (
                    <div className="flex flex-wrap gap-2 pt-2 animate-in fade-in slide-in-from-top-2">
                        <button
                            onClick={() => setStatusFilter(null)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                !statusFilter ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            All
                        </button>
                        {statuses.map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                    statusFilter === status
                                        ? "bg-brand-blue text-white border-brand-blue"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {status.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Vendor Name</th>
                            <th className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Vendor Invoice Nr.</th>
                            <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Line Value</th>
                            <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Arrival Date</th>
                            <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Operation</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                                        <div className="bg-slate-50 p-6 rounded-full mb-4 ring-8 ring-slate-50/50">
                                            <Briefcase size={32} />
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">No results found</p>
                                        <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <StatusBadge status={invoice.status} />
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-navy to-brand-blue text-white flex items-center justify-center font-black text-xs shadow-md shadow-brand-blue/10">
                                                {invoice.vendor_name_extracted?.substring(0, 2).toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{invoice.vendor_name_extracted || 'Extracting Vendor...'}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">SAP ID: {invoice.vendor_id || 'PENDING'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-slate-800 tracking-tight">{invoice.invoice_number || 'INV-PENDING'}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold w-fit">PO: {invoice.po_reference || 'SCANNING'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <span className="text-sm font-black text-slate-900 tabular-nums">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(invoice.total_amount) || 0)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <span className="text-sm font-medium text-slate-500 tabular-nums">
                                            {new Date(invoice.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <Link
                                            href={`/invoices/${invoice.id}`}
                                            className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold text-slate-700 shadow-sm hover:bg-brand-navy hover:text-white hover:border-brand-navy hover:shadow-lg hover:shadow-brand-navy/20 transition-all flex items-center gap-2 w-fit ml-auto"
                                        >
                                            Review <ArrowUpRight size={12} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* List Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <Layers size={14} /> Total Records: {filteredInvoices.length}
                </div>
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
        POSTED: 'bg-slate-50 text-slate-600 border-slate-200',
        REJECTED: 'bg-red-50 text-red-700 border-red-100 shadow-red-100/20',
        AWAITING_INFO: 'bg-purple-50 text-purple-700 border-purple-100 shadow-purple-100/20'
    }

    const icons: Record<string, React.ReactNode> = {
        PROCESSING: <Clock size={10} className="animate-spin" />,
        READY_TO_POST: <CheckCircle size={10} />,
        BLOCKED_PRICE: <AlertCircle size={10} />,
        BLOCKED_QTY: <AlertCircle size={10} />,
        POSTED: <CheckCircle size={10} />,
        REJECTED: <AlertCircle size={10} />,
        AWAITING_INFO: <AlertCircle size={10} />
    }

    return (
        <span className={cn(
            "px-3 py-1.5 rounded-xl text-[10px] font-black border flex items-center gap-2 w-fit uppercase tracking-wider shadow-sm",
            styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
        )}>
            {icons[status] || <Layers size={10} />}
            {status.replace(/_/g, ' ')}
        </span>
    )
}
