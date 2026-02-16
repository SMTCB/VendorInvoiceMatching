import { createClient } from '@/lib/supabase/server'
import {
    BarChart3,
    TrendingUp,
    AlertTriangle,
    Wallet,
    PieChart,
    Activity,
    Zap,
    ArrowUp,
    ArrowDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AnalysisPage() {
    const supabase = await createClient()

    // Fetch data for analysis
    const { data: invoices } = await supabase.from('invoices').select('*')

    const total = invoices?.length || 0
    const processedValue = invoices?.filter(i => i.status === 'POSTED').reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0) || 0
    const blockedValue = invoices?.filter(i => i.status.includes('BLOCKED')).reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0) || 0
    const syncRate = 84.5 // Mock for now

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 sticky top-0 z-20 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight text-brand-navy">Intelligence Analysis</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] opacity-70 mt-1 flex items-center gap-2">
                        <Activity size={12} className="text-brand-cyan" /> Business Intelligence & AP Performance
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white border p-2 rounded-xl text-xs font-bold text-slate-500">Last 30 Days</div>
                </div>
            </header>

            <div className="p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">

                {/* Top Stats Hero */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InsightCard
                        title="Total Liquidity Managed"
                        value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(processedValue + blockedValue)}
                        sub="Cumulative through pipeline"
                        icon={<Wallet className="text-blue-500" />}
                        trend="+8.2%"
                        up
                    />
                    <InsightCard
                        title="Automation Sync Rate"
                        value={`${syncRate}%`}
                        sub="AI-matched without manual touch"
                        icon={<Zap className="text-brand-cyan" />}
                        trend="+1.4%"
                        up
                    />
                    <InsightCard
                        title="Discrepancy Exposure"
                        value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(blockedValue)}
                        sub="Value currently blocked by AI"
                        icon={<AlertTriangle className="text-amber-500" />}
                        trend="-4.1%"
                    />
                </div>

                {/* Chart Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Volume Trend Chart */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                <BarChart3 size={14} className="text-brand-blue" /> Processing Volume Trend
                            </h3>
                        </div>
                        <div className="flex items-end justify-between h-48 gap-2">
                            {[35, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <div
                                        className="bg-slate-100 group-hover:bg-brand-blue transition-all rounded-t-lg w-full"
                                        style={{ height: `${h}%` }}
                                    />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                                        {h} Invoices
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                <PieChart size={14} className="text-brand-cyan" /> Status Distribution
                            </h3>
                        </div>
                        <div className="space-y-6">
                            <DistributionBar label="Verified & Posted" percentage={72} color="bg-emerald-500" />
                            <DistributionBar label="Price Discrepancy" percentage={18} color="bg-amber-500" />
                            <DistributionBar label="Quantity Variance" percentage={6} color="bg-orange-500" />
                            <DistributionBar label="Rejected / Void" percentage={4} color="bg-slate-300" />
                        </div>
                    </div>
                </div>

                {/* Deep Insights List */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-8">AI-Detected Anomalies (Top 3)</h3>
                    <div className="space-y-4">
                        <AnomalyRow
                            vendor="TechParts Ltd"
                            frequency="3 instances"
                            impact="$1,240.00"
                            type="Consensus Variance"
                        />
                        <AnomalyRow
                            vendor="MegaLogistics"
                            frequency="12 instances"
                            impact="$15,400.00"
                            type="Duplicate Detection"
                        />
                        <AnomalyRow
                            vendor="OfficeDepot"
                            frequency="5 instances"
                            impact="$450.00"
                            type="Tax Miscalc"
                        />
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/10 rounded-full translate-x-16 -translate-y-16 scale-150" />
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
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

function AnomalyRow({ vendor, frequency, impact, type }: { vendor: string, frequency: string, impact: string, type: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-colors group">
            <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{vendor}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{type}</div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-sm font-black text-slate-900">{impact}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{frequency}</div>
            </div>
        </div>
    )
}
