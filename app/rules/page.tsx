import { createClient } from '@/lib/supabase/server'
import {
    Plus,
    ShieldCheck,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Info,
    ChevronRight,
    Wand2,
    Settings2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function RulesPage() {
    const supabase = await createClient()

    // For POC: Using mock rules if table doesn't exist yet
    // Once user runs the SQL, this will pull from DB
    let { data: rules, error } = await supabase.from('validator_rules').select('*').order('created_at', { ascending: false })

    const mockRules = [
        { id: '1', name: 'TechParts Auto-Approve', condition_field: 'vendor_name', operator: 'equals', value: 'TechParts Ltd', action: 'auto_approve', is_active: true },
        { id: '2', name: 'High Value Flag', condition_field: 'total_amount', operator: 'greater_than', value: '5000', action: 'flag_review', is_active: true },
        { id: '3', name: 'Lego Millenium Block', condition_field: 'po_reference', operator: 'contains', value: '75192', action: 'flag_review', is_active: false }
    ]

    const displayRules = (error || !rules || rules.length === 0) ? mockRules : rules

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 sticky top-0 z-20 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">AI Validation Rules</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] opacity-70 mt-1 flex items-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-500" /> Defining the boundaries of AI Autonomy
                    </p>
                </div>
                <button className="bg-brand-navy hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-brand-navy/20 flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98]">
                    <Plus size={16} /> Create New Rule
                </button>
            </header>

            <div className="p-8 max-w-5xl mx-auto w-full space-y-8">

                {/* Info Box */}
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start gap-4">
                    <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                        <Wand2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-indigo-900 font-bold text-sm">How AI Rules Work</h3>
                        <p className="text-indigo-800/70 text-xs mt-1 leading-relaxed">
                            Rules are applied instantly during the "Matching Smart Judge" workflow. When a rule condition is met, the AI will bypass standard consensus and apply your specified action (e.g., auto-posting or flagging for manual review).
                        </p>
                    </div>
                </div>

                {/* Rules Grid */}
                <div className="grid gap-4">
                    {displayRules.map((rule) => (
                        <div key={rule.id} className={cn(
                            "bg-white p-6 rounded-2xl border transition-all flex items-center justify-between group",
                            rule.is_active ? "border-slate-200 shadow-sm" : "border-slate-100 opacity-60 bg-slate-50/50"
                        )}>
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-inner",
                                    rule.is_active ? "bg-gradient-to-br from-indigo-500 to-brand-blue" : "bg-slate-300"
                                )}>
                                    <Settings2 size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-base font-black text-slate-900">{rule.name}</h4>
                                        <ActionBadge action={rule.action} />
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 uppercase tracking-tighter">IF</span>
                                        <span className="italic text-slate-700 font-bold">{rule.condition_field.replace('_', ' ')}</span>
                                        <span className="text-slate-400">{rule.operator.replace('_', ' ')}</span>
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-100">"{rule.value}"</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end mr-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                                    <button className="transition-all hover:scale-110">
                                        {rule.is_active ? <ToggleRight className="text-emerald-500" size={32} /> : <ToggleLeft className="text-slate-300" size={32} />}
                                    </button>
                                </div>
                                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 size={18} />
                                </button>
                                <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State / Add Suggestion */}
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="text-slate-300" size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Need more control?</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Create rules for tax deviations, specific material codes, or vendor-specific tolerances.</p>
                    <button className="mt-6 text-brand-blue font-black text-[10px] uppercase tracking-widest hover:underline">
                        View Rule Templates →
                    </button>
                </div>
            </div>
        </div>
    )
}

function ActionBadge({ action }: { action: string }) {
    const styles: Record<string, string> = {
        auto_approve: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        flag_review: 'bg-amber-50 text-amber-700 border-amber-100',
        reject: 'bg-red-50 text-red-700 border-red-100'
    }

    return (
        <span className={cn(
            "px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-widest",
            styles[action] || 'bg-slate-100 text-slate-600'
        )}>
            {action.replace('_', ' ')}
        </span>
    )
}
