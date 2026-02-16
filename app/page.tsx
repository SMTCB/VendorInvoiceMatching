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
  DollarSign,
  TrendingUp,
  Briefcase,
  Layers,
  Zap,
  LayoutDashboard
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const supabase = await createClient()

  // Try fetching from Supabase first
  let { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })

  // FALLBACK: Use Mock Data if DB is empty or fails
  if (error || !invoices || invoices.length === 0) {
    const { getInvoices } = await import('@/lib/data/mock-invoices');
    invoices = await getInvoices() as any;
    error = null;
  }

  // Calculate generic stats
  const totalInvoices = invoices?.length || 0;
  const readyToPost = invoices?.filter(i => i.status === 'READY_TO_POST').length || 0;
  const exceptions = invoices?.filter(i => i.status.includes('BLOCKED') || i.status === 'REJECTED' || i.status === 'AWAITING_INFO').length || 0;
  const totalValue = invoices?.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0) || 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">

      {/* Premium Top Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-brand-navy p-2 rounded-lg text-white">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Intelligence Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">AP + AI Operating System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                U{i}
              </div>
            ))}
          </div>
          <button className="bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-brand-navy/20 hover:scale-[1.02] transition-transform flex items-center gap-2">
            <Zap size={14} className="text-brand-cyan" />
            Process New Batch
          </button>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Hero / Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Finance Operations</h2>
            <p className="text-slate-500 mt-1 text-lg">You have <span className="text-brand-blue font-bold">{readyToPost}</span> invoices ready for final posting.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium italic">
            <Clock size={16} /> Last synced: 2 minutes ago
          </div>
        </section>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Active Pipeline"
            sub="Processing Invoices"
            value={totalInvoices.toString()}
            icon={<Layers className="text-brand-blue" />}
            trend="+12% volume"
          />
          <StatCard
            title="Verified Match"
            sub="Ready for Posting"
            value={readyToPost.toString()}
            icon={<CheckCircle className="text-emerald-500" />}
            trend="High Accuracy"
            isActionable
          />
          <StatCard
            title="Discrepancies"
            sub="Action Required"
            value={exceptions.toString()}
            icon={<AlertCircle className="text-amber-500" />}
            trend="Critical Blockers"
            isWarning
          />
          <StatCard
            title="Liquidity Impact"
            sub="Total value pending"
            value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalValue)}
            icon={<TrendingUp className="text-brand-cyan" />}
            trend="Pending approval"
          />
        </div>

        {/* List Section Container */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col">

          {/* List Header / Filter Bar */}
          <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/30">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-slate-900">Incoming Payables</h3>
              <div className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ring-1 ring-indigo-100 italic flex items-center gap-1">
                <Zap size={10} /> AI Enhanced
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search vendor name, PO or invoice #..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                <Filter size={14} /> Filters
              </button>
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-white">
                <tr>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Vendor Intelligence</th>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Financial Ref.</th>
                  <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Line Value</th>
                  <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Arrival Date</th>
                  <th className="px-8 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Operation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {invoices?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                        <div className="bg-slate-50 p-6 rounded-full mb-4 ring-8 ring-slate-50/50">
                          <Briefcase size={32} />
                        </div>
                        <p className="text-lg font-bold text-slate-900">Zero active items</p>
                        <p className="text-sm mt-1">Your AP pipeline is clear. New invoices will appear here automatically.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices?.map((invoice) => (
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
              <Layers size={14} /> Total Records: {invoices?.length}
            </div>
            <div className="flex gap-2">
              <button disabled className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Previous</button>
              <button disabled className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, sub, value, icon, trend, isActionable, isWarning }: { title: string, sub: string, value: string, icon: React.ReactNode, trend?: string, isActionable?: boolean, isWarning?: boolean }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-brand-blue/30 transition-all group overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
          <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-accent-light transition-colors">
            {icon}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-black text-slate-900 tracking-tighter">{value}</span>
          <span className="text-sm font-medium text-slate-500 mt-0.5">{sub}</span>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isActionable ? "bg-emerald-500 animate-pulse" : isWarning ? "bg-amber-500 animate-pulse" : "bg-brand-blue"
          )} />
          <span className={cn(
            "text-[10px] font-black uppercase tracking-tight",
            isActionable ? "text-emerald-700" : isWarning ? "text-amber-700" : "text-brand-blue"
          )}>{trend}</span>
        </div>
      </div>
      {/* Subtle background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 scale-150 rotate-12 transition-all">
        {icon}
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
    PROCESSING: <Clock size={10} className="animate-spin-slow" />,
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

function FileText({ className, size }: { className?: string, size?: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
}
