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
import React from 'react'
import { StatusBadge } from '@/components/ui/invoice-status-badge'

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
  const totalInvoices = actionableInvoices.length;
  const readyToPost = actionableInvoices.filter(i => i.status === 'READY_TO_POST').length;
  const exceptions = actionableInvoices.filter(i =>
    i.status.includes('BLOCKED') ||
    i.status === 'REJECTED' ||
    i.status === 'AWAITING_INFO'
  ).length;
  const otherCases = totalInvoices - readyToPost - exceptions;

  // Real Sync Time
  const latestInvoice = invoices?.[0];
  const lastSynced = latestInvoice
    ? formatDistanceToNow(new Date(latestInvoice.created_at), { addSuffix: true })
    : 'Never';

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen font-sans">

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
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Finance Operations</h2>
            <p className="text-slate-500 mt-2 text-lg">You have <span className="text-brand-blue font-black underline decoration-indigo-200 underline-offset-4">{readyToPost}</span> invoices ready for final posting.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full">
            <Clock size={12} className="text-brand-blue" /> Last synced: {lastSynced}
          </div>
        </section>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Active Pipeline"
            sub="Total Processing"
            value={totalInvoices.toString()}
            icon={<Layers className="text-indigo-600" />}
            trend="Live Queue"
          />
          <StatCard
            title="Verified Match"
            sub="Ready for Posting"
            value={readyToPost.toString()}
            icon={<CheckCircle className="text-emerald-500" />}
            trend="Audit Passed"
            isActionable
          />
          <StatCard
            title="Discrepancies"
            sub="Action Required"
            value={exceptions.toString()}
            icon={<AlertCircle className="text-rose-500" />}
            trend="Blocked Items"
            isWarning
          />
          <StatCard
            title="Other Cases"
            sub="Scanning / Parked"
            value={otherCases.toString()}
            icon={<Clock className="text-cyan-500" />}
            trend="Pending Review"
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
    <div className="bg-white p-7 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-brand-blue/30 transition-all group overflow-hidden relative">
      <div className="relative z-10 font-sans">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
          <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors duration-500">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 20 }) : icon}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</span>
          <span className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">{sub}</span>
        </div>
        <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isActionable ? "bg-emerald-500 animate-pulse" : isWarning ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "bg-indigo-400"
            )} />
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              isActionable ? "text-emerald-700" : isWarning ? "text-rose-700" : "text-slate-500"
            )}>{trend}</span>
          </div>
        </div>
      </div>
      {/* Premium background gradient blob */}
      <div className={cn(
        "absolute -right-10 -top-10 w-32 h-32 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700",
        isActionable ? "bg-emerald-400" : isWarning ? "bg-rose-400" : "bg-indigo-400"
      )} />
    </div>
  )
}



function FileText({ className, size }: { className?: string, size?: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
}
