import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Layers,
  LayoutDashboard
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { PollPortalButton } from '@/components/poll-portal-button'
import { InvoiceList } from '@/components/invoice-list'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const supabase = await createClient()

  // Fetch all for accurate stats, filter for display in the table below
  let { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })

  const actionableInvoices = invoices?.filter(i => !['POSTED', 'REJECTED'].includes(i.status)) || [];

  // FALLBACK: Use Mock Data if DB is empty or fails
  // FALLBACK: Use Mock Data if DB is empty or fails
  // Commented out to prevent "ghost data" when starting fresh
  /*
  if (error || !invoices || invoices.length === 0) {
    const { getInvoices } = await import('@/lib/data/mock-invoices');
    invoices = await getInvoices() as any;
    error = null;
  }
  */

  // Calculate generic stats
  const totalInvoices = invoices?.length || 0;
  const readyToPost = invoices?.filter(i => i.status === 'READY_TO_POST').length || 0;
  const exceptions = invoices?.filter(i => i.status.includes('BLOCKED') || i.status === 'REJECTED' || i.status === 'AWAITING_INFO').length || 0;
  const totalValue = invoices?.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0) || 0;

  // Real Sync Time
  const latestInvoice = invoices?.[0];
  const lastSynced = latestInvoice
    ? formatDistanceToNow(new Date(latestInvoice.created_at), { addSuffix: true })
    : 'Never';

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">

      {/* Premium Top Bar */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white px-8 py-5 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Logo showText={false} width={260} height={90} className="-ml-4 drop-shadow-2xl" />
          <div className="relative">
            <h1 className="text-2xl font-black text-brand-navy leading-tight tracking-[calc(-0.025em)] bg-clip-text text-transparent bg-gradient-to-r from-brand-navy to-brand-blue">
              Intelligence Command Center
            </h1>
            <p className="text-[10px] text-brand-blue font-black uppercase tracking-[0.3em] opacity-80 mt-0.5">Automated AP Operating System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PollPortalButton />
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
            <Clock size={16} /> Last synced: {lastSynced}
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
        <InvoiceList invoices={actionableInvoices} />

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
