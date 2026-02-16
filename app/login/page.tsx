'use client'

import { useState } from 'react'
import { login, signup } from '@/lib/auth-actions'
import { Logo } from '@/components/ui/logo'
import { Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = mode === 'signin' ? await login(formData) : await signup(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-navy flex items-center justify-center p-6 relative overflow-hidden">

            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan/10 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <div className="w-full max-w-[440px] relative z-10">

                {/* Branding Section */}
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm mb-2">
                        <Logo showText={false} width={48} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                        Welcome to <span className="text-brand-cyan px-1">AP + AI</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-sm tracking-wide">
                        Accounts Payable with Intelligence. Secure Auditor Access.
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl border border-slate-100 relative overflow-hidden">

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1" htmlFor="email">Work Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="auditor@company.com"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1" htmlFor="password">Security Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase tracking-tight flex items-center gap-2 animate-in slide-in-from-top-1">
                                <Zap size={14} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-navy text-white py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-brand-navy/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Verifying Identity...
                                </>
                            ) : (
                                <>
                                    {mode === 'signin' ? 'Unlock Platform' : 'Create Auditor Account'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                        <button
                            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                            className="text-[10px] font-black text-slate-400 hover:text-brand-blue uppercase tracking-widest transition-colors underline decoration-slate-200 underline-offset-4"
                        >
                            {mode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                        </button>
                    </div>
                </div>

                {/* Security Footer */}
                <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest opacity-60">
                    <ShieldCheck size={14} className="text-brand-cyan" />
                    End-to-End Encrypted Audit Trail
                </div>

            </div>
        </div>
    )
}
