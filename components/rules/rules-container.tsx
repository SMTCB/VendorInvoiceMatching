'use client'

import { useState } from 'react'
import {
    Plus,
    X,
    ShieldCheck,
    Trash2,
    ToggleLeft,
    ToggleRight,
    ChevronRight,
    Wand2,
    Settings2,
    Check,
    ArrowRight,
    ArrowLeft,
    AlertTriangle,
    Save,
    Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Rule {
    id: string
    name: string
    description?: string
    condition_field: string
    operator: string
    value: string
    action: string
    is_active: boolean
    created_at?: string
}

interface RulesContainerProps {
    initialRules: Rule[]
}

export function RulesContainer({ initialRules }: RulesContainerProps) {
    const [rules, setRules] = useState<Rule[]>(initialRules)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)

    // New Rule State
    const [newRule, setNewRule] = useState<Partial<Rule>>({
        name: '',
        description: '',
        condition_field: 'vendor_name',
        operator: 'equals',
        value: '',
        action: 'auto_approve',
        is_active: true
    })

    const supabase = createClient()

    const handleCreateRule = async () => {
        setIsSaving(true)
        try {
            const { data, error } = await supabase
                .from('validator_rules')
                .insert([newRule])
                .select()
                .single()

            if (error) throw error

            setRules([data, ...rules])
            setIsModalOpen(false)
            setStep(1)
            setNewRule({
                name: '',
                description: '',
                condition_field: 'vendor_name',
                operator: 'equals',
                value: '',
                action: 'auto_approve',
                is_active: true
            })
        } catch (error) {
            console.error('Error creating rule:', error)
            alert('Failed to create rule. Make sure the table exists.')
        } finally {
            setIsSaving(false)
        }
    }

    const toggleRule = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus
        setRules(rules.map(r => r.id === id ? { ...r, is_active: newStatus } : r))

        await supabase
            .from('validator_rules')
            .update({ is_active: newStatus })
            .eq('id', id)
    }

    const deleteRule = async (id: string) => {
        if (!confirm('Are you sure you want to delete this rule?')) return

        setRules(rules.filter(r => r.id !== id))
        await supabase
            .from('validator_rules')
            .delete()
            .eq('id', id)
    }

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
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-navy hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-brand-navy/20 flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98]"
                >
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
                    {rules.map((rule) => (
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
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-100 uppercase text-[10px]">"{rule.value}"</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end mr-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                                    <button
                                        onClick={() => toggleRule(rule.id, rule.is_active)}
                                        className="transition-all hover:scale-110"
                                    >
                                        {rule.is_active ? <ToggleRight className="text-emerald-500" size={32} /> : <ToggleLeft className="text-slate-300" size={32} />}
                                    </button>
                                </div>
                                <button
                                    onClick={() => deleteRule(rule.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State / Templates */}
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center group hover:border-brand-blue/30 transition-colors cursor-pointer" onClick={() => setIsModalOpen(true)}>
                    <div className="bg-slate-50 group-hover:bg-brand-blue/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                        <Plus className="text-slate-300 group-hover:text-brand-blue transition-colors" size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Need more control?</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Create rules for tax deviations, specific material codes, or vendor-specific tolerances.</p>
                    <button className="mt-6 text-brand-blue font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2 mx-auto">
                        Open Rule Creation Wizard <ChevronRight size={12} />
                    </button>
                </div>
            </div>

            {/* CREATE RULE MODAL (MULTI-STEP) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 leading-none">Create AI Rule</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Step {step} of 3</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 w-full bg-slate-100">
                            <div
                                className="h-full bg-brand-blue transition-all duration-500"
                                style={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 flex-1 overflow-y-auto min-h-[400px]">
                            {step === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="bg-brand-blue/5 p-4 rounded-2xl flex items-start gap-4 border border-brand-blue/10">
                                        <Info className="text-brand-blue mt-0.5" size={18} />
                                        <p className="text-xs text-brand-blue/80 leading-relaxed font-medium">
                                            First, let's give your rule a name and a description so your team understands why this rule exists.
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rule Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Office Depot Auto-Approval"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                            value={newRule.name}
                                            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description (Optional)</label>
                                        <textarea
                                            placeholder="Why are we allowing this automation?"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all min-h-[100px]"
                                            value={newRule.description}
                                            onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="bg-indigo-50 p-4 rounded-2xl flex items-start gap-4 border border-indigo-100">
                                        <Settings2 className="text-indigo-600 mt-0.5" size={18} />
                                        <p className="text-xs text-indigo-900/70 leading-relaxed font-medium">
                                            Define the logic. If these conditions are met, the AI will trigger the specified action.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">When Field...</label>
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue appearance-none transition-all"
                                                value={newRule.condition_field}
                                                onChange={(e) => setNewRule({ ...newRule, condition_field: e.target.value })}
                                            >
                                                <option value="vendor_name">Vendor Name</option>
                                                <option value="total_amount">Total Amount</option>
                                                <option value="po_reference">PO Reference</option>
                                                <option value="invoice_number">Invoice Number</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</label>
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue appearance-none transition-all"
                                                value={newRule.operator}
                                                onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                                            >
                                                <option value="equals">Equals</option>
                                                <option value="contains">Contains</option>
                                                <option value="greater_than">Is Greater Than</option>
                                                <option value="less_than">Is Less Than</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Value to Match</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 5000 or TechParts"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                            value={newRule.value}
                                            onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                                        />
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center gap-3">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Logic Preview:</span>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                            <span className="bg-slate-200 px-2 py-0.5 rounded uppercase tracking-tighter text-[9px] text-slate-500">IF</span>
                                            <span className="text-brand-blue">{newRule.condition_field?.replace('_', ' ')}</span>
                                            <span className="text-slate-400">{newRule.operator?.replace('_', ' ')}</span>
                                            <span className="text-indigo-600">"{newRule.value || '...'}"</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="bg-emerald-50 p-4 rounded-2xl flex items-start gap-4 border border-emerald-100">
                                        <ShieldCheck className="text-emerald-600 mt-0.5" size={18} />
                                        <p className="text-xs text-emerald-900/70 leading-relaxed font-medium">
                                            Finally, choose the outcome. What should the AI do when the condition is met?
                                        </p>
                                    </div>

                                    <div className="grid gap-3">
                                        <ActionCard
                                            active={newRule.action === 'auto_approve'}
                                            onClick={() => setNewRule({ ...newRule, action: 'auto_approve' })}
                                            icon={<Check className="text-emerald-500" />}
                                            title="Auto-Approve"
                                            description="AI will instantly mark it as READY_TO_POST. Use for trusted high-volume vendors."
                                        />
                                        <ActionCard
                                            active={newRule.action === 'flag_review'}
                                            onClick={() => setNewRule({ ...newRule, action: 'flag_review' })}
                                            icon={<AlertTriangle className="text-amber-500" />}
                                            title="Flag for Review"
                                            description="AI will notify a human controller instead of making a final decision. Best for high-value items."
                                        />
                                        <ActionCard
                                            active={newRule.action === 'reject'}
                                            onClick={() => setNewRule({ ...newRule, action: 'reject' })}
                                            icon={<X className="text-red-500" />}
                                            title="Auto-Reject"
                                            description="Immediately block the invoice. Best for blacklisted vendors or expired projects."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <button
                                onClick={() => step > 1 ? setStep(step - 1) : setIsModalOpen(false)}
                                className="px-6 py-2.5 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-200 transition-all flex items-center gap-2"
                            >
                                {step === 1 ? 'Cancel' : <><ArrowLeft size={14} /> Back</>}
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={step === 1 && !newRule.name}
                                    className="bg-brand-navy text-white px-8 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-brand-navy/20 flex items-center gap-2 transition-all hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    Next Step <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleCreateRule}
                                    disabled={isSaving}
                                    className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-[1.03]"
                                >
                                    {isSaving ? 'Scaling...' : <><Save size={14} /> Create AI Rule</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
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

function ActionCard({ active, onClick, icon, title, description }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string, description: string }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4",
                active ? "border-brand-blue bg-brand-blue/5" : "border-slate-100 hover:border-slate-200 bg-white"
            )}
        >
            <div className={cn("p-2 rounded-xl shrink-0 transition-colors", active ? "bg-white" : "bg-slate-50")}>
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-black text-slate-800 leading-tight">{title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
            </div>
            <div className={cn(
                "ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                active ? "border-brand-blue bg-brand-blue text-white" : "border-slate-200"
            )}>
                {active && <Check size={12} strokeWidth={4} />}
            </div>
        </div>
    )
}
