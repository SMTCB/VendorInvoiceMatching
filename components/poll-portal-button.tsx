'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PollPortalButton() {
    const router = useRouter()
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    async function handlePoll() {
        if (status === 'loading') return

        setStatus('loading')
        setMessage('Contacting Vendor Portal...')

        try {
            const response = await fetch('/api/poll-portal', {
                method: 'POST',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to trigger portal sync')
            }

            setStatus('success')
            setMessage('New invoices arriving!')

            // Trigger a UI refresh to show new data
            router.refresh()

            // Auto reset after 3 seconds
            setTimeout(() => {
                setStatus('idle')
                setMessage('')
            }, 3000)

        } catch (err: any) {
            console.error('Portal sync error:', err)
            setStatus('error')
            setMessage(err.message || 'Workflow trigger failed')

            setTimeout(() => {
                setStatus('idle')
                setMessage('')
            }, 5000)
        }
    }

    return (
        <div className="relative group">
            <button
                onClick={handlePoll}
                disabled={status === 'loading'}
                className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg",
                    status === 'idle' && "bg-brand-navy text-white hover:scale-[1.02] shadow-brand-navy/20",
                    status === 'loading' && "bg-slate-100 text-slate-400 cursor-wait",
                    status === 'success' && "bg-emerald-500 text-white shadow-emerald-500/20",
                    status === 'error' && "bg-red-500 text-white shadow-red-500/20"
                )}
            >
                {status === 'idle' && (
                    <>
                        <Zap size={14} className="text-brand-cyan" />
                        Poll Vendor Portal
                    </>
                )}
                {status === 'loading' && (
                    <>
                        <Loader2 size={14} className="animate-spin" />
                        Polling...
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle2 size={14} />
                        Started
                    </>
                )}
                {status === 'error' && (
                    <>
                        <AlertCircle size={14} />
                        Error
                    </>
                )}
            </button>

            {message && (
                <div className={cn(
                    "absolute -bottom-10 right-0 whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white border shadow-sm z-50 animate-in fade-in slide-in-from-top-1",
                    status === 'success' ? "text-emerald-600 border-emerald-100" :
                        status === 'error' ? "text-red-600 border-red-100" : "text-slate-400 border-slate-100"
                )}>
                    {message}
                </div>
            )}
        </div>
    )
}
