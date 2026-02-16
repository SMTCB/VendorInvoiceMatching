'use client'

import { logout } from '@/lib/auth-actions'
import { LogOut, User } from 'lucide-react'

interface UserProfileProps {
    user: {
        email?: string;
        user_metadata?: {
            full_name?: string;
        };
    }
}

export function UserProfile({ user }: UserProfileProps) {
    const email = user.email || 'Auditor'
    const name = user.user_metadata?.full_name || email.split('@')[0]
    const initials = name.substring(0, 2).toUpperCase()

    return (
        <div className="p-6 border-t border-white/5 bg-black/10">
            <div className="flex items-center gap-3 group">
                <div title={email} className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center text-xs font-black shadow-lg shadow-brand-cyan/20 cursor-default">
                    {initials}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-black truncate uppercase tracking-tight text-white">{name}</p>
                    <p className="text-[10px] text-slate-400 truncate uppercase font-bold tracking-tighter">Finance Auditor</p>
                </div>
                <form action={logout}>
                    <button
                        type="submit"
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </form>
            </div>
        </div>
    )
}
