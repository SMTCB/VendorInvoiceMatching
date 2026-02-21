import { createClient } from '@/lib/supabase/server'
import {
    PieChart,
    Activity,
    Zap,
    ArrowUp,
    ArrowDown,
    Wallet,
    AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'

export const dynamic = 'force-dynamic'

export default async function AnalysisPage() {
    const supabase = await createClient()

    // Fetch data for analysis
    const { data: invoices } = await supabase.from('invoices').select('*')
    const { data: rules } = await supabase.from('validator_rules').select('*')
    const { data: learning } = await supabase.from('ai_learning_examples').select('*')

    const total = invoices?.length || 0
    const blockedCount = invoices?.filter(i => i.status.includes('BLOCKED')).length || 0
    const ruleBasedCount = invoices?.filter(i => i.audit_trail?.toLowerCase().includes('rule')).length || 0
    const manualOverrides = learning?.length || 0
    const syncRate = total > 0 ? Math.round(((total - blockedCount) / total) * 100) : 0

    // Grouping for "Vendors with most discrepancies"
    const vendorStats: Record<string, number> = {}
    invoices?.forEach(inv => {
        if (inv.status.includes('BLOCKED')) {
            const v = inv.vendor_name_extracted || 'Unknown'
            vendorStats[v] = (vendorStats[v] || 0) + 1
        }
    })
    const topDiscrepantVendors = Object.entries(vendorStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen font-sans">

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 sticky top-0 z-20 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-brand-navy leading-tight tracking-tight">Platform Performance</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] opacity-70 mt-1 flex items-center gap-2">
                        <Activity size={12} className="text-brand-blue" /> System Intelligence & AI Accuracy
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-slate-100 px-4 py-2 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Metrics</div>
                </div>
            </header>

            <div className="p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">

                {/* Top Stats Hero */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <InsightCard
                        title="Manual Overwrites"
                        value={manualOverrides.toString()}
                        sub="User vs AI decision correction"
                        icon={<Wallet className="text-brand-blue" />}
                        trend="Feedback Loop"
                        up
                    />
                    <InsightCard
                        title="AI Rules Applied"
                        value={ruleBasedCount.toString()}
                        sub="Special policy matches"
                        icon={<Zap className="text-brand-cyan" />}
                        trend="Policy Engine"
                        up
                    />
                    <InsightCard
                        title="Learning Memory"
                        value={manualOverrides.toString()}
                        sub="Active historical examples"
                        icon={<PieChart className="text-purple-500" />}
                        trend="Neural Cache"
                    />
                    <InsightCard
                        title="Touchless Rate"
                        value={`${syncRate}%`}
                        sub="Auto-matched invoices"
                        icon={<Activity className="text-emerald-500" />}
                        trend="Effort Reduction"
                        up
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Vendor Discrepancy Overview */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-3">
                                <AlertTriangle size={16} className="text-rose-500" /> Discrepancy by Vendor
                            </h3>
                        </div>
                        <div className="space-y-5 relative z-10">
                            {topDiscrepantVendors.length > 0 ? topDiscrepantVendors.map(([vendor, count]) => (
                                <div key={vendor} className="group/row">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="text-sm font-black text-slate-800 tracking-tight">{vendor}</div>
                                        <div className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase">{count} Blocks</div>
                                    </div>
                                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden ring-1 ring-slate-100">
                                        <div
                                            className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
                                            style={{ width: `${(count / (blockedCount || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-400 font-medium">No discrepancies detected in current batch.</div>
                            )}
                        </div>
                    </div>

                    {/* Platform Health / Status Distribution */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-3">
                                <PieChart size={16} className="text-brand-blue" /> Processing Distribution
                            </h3>
                        </div>
                        <div className="space-y-6">
                            <DistributionBar label="Touchless Success" percentage={syncRate} color="bg-emerald-500" />
                            <DistributionBar label="Price Exceptions" percentage={Math.round((invoices?.filter(i => i.status === 'BLOCKED_PRICE').length || 0) / (total || 1) * 100)} color="bg-rose-500" />
                            <DistributionBar label="Quantity Exceptions" percentage={Math.round((invoices?.filter(i => i.status === 'BLOCKED_QTY').length || 0) / (total || 1) * 100)} color="bg-amber-500" />
                            <DistributionBar label="Other Reviews" percentage={Math.max(0, 100 - syncRate - Math.round((invoices?.filter(i => i.status.includes('BLOCKED_PRICE') || i.status.includes('BLOCKED_QTY')).length || 0) / (total || 1) * 100))} color="bg-slate-300" />
                        </div>
                    </div>
                </div>

                {/* Active Rules List */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Active Special AI Rules</h3>
                        <div className="text-[10px] font-black text-brand-blue uppercase bg-brand-blue/5 px-3 py-1 rounded-full">{rules?.length || 0} Enabled</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rules?.map((rule) => (
                            <div key={rule.id} className="p-4 bg-slate-50 border border-slate-100 rounded-3xl hover:border-brand-blue/30 transition-all group">
                                <div className="text-xs font-black text-slate-900 mb-1 group-hover:text-brand-blue transition-colors line-clamp-1">{rule.name}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{rule.condition_field} : {rule.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function InsightCard({ title, value, sub, icon, trend, up }: { title: string, value: string, sub: string, icon: React.ReactNode, trend: string, up?: boolean }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/20 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
                <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full",
                    up ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                    {up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {trend}
                </div>
            </div>
            <div className="mt-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
                <div className="text-2xl font-black text-slate-900 tabular-nums">{value}</div>
                <p className="text-[10px] text-slate-500 font-medium mt-1 italic">{sub}</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/10 rounded-full translate-x-16 -translate-y-16 scale-150 transition-transform group-hover:translate-x-12" />
        </div>
    )
}

function DistributionBar({ label, percentage, color }: { label: string, percentage: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden ring-1 ring-slate-100">
                <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}
