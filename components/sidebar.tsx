'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, ShieldCheck, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./ui/logo";
import { UserProfile } from "./user-profile";

export function Sidebar({ user }: { user: any }) {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-brand-navy text-white flex-shrink-0 flex flex-col shadow-2xl shadow-brand-navy/50 z-30 h-screen sticky top-0 border-r border-white/5">
            <div className="p-8 space-y-4">
                <Logo showText={false} width={180} height={60} className="brightness-0 invert opacity-90 -ml-2" />
                <div className="pt-2">
                    <h2 className="text-white font-black text-2xl tracking-tighter leading-none mb-1">
                        AP + AI
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-60">
                        Accounts Payable Intelligence
                    </p>
                </div>
            </div>

            <nav className="flex-1 p-6 space-y-2">
                <NavLink
                    href="/"
                    icon={<LayoutDashboard size={18} />}
                    label="Controller"
                    active={pathname === "/"}
                />
                <NavLink
                    href="/document-hub"
                    icon={<FileText size={18} />}
                    label="Document Hub"
                    active={pathname === "/document-hub"}
                />
                <NavLink
                    href="/rules"
                    icon={<ShieldCheck size={18} />}
                    label="AI Rules"
                    active={pathname === "/rules"}
                />
                <NavLink
                    href="/analysis"
                    icon={<PieChart size={18} />}
                    label="Analysis"
                    active={pathname === "/analysis"}
                />
            </nav>

            {/* Profile area moved inside sidebar */}
            <div className="mt-auto p-4 border-t border-white/5">
                <UserProfile user={user} />
            </div>
        </aside>
    );
}

function NavLink({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                active
                    ? "bg-white/5 border-white/10 text-brand-cyan shadow-sm"
                    : "border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/5"
            )}
        >
            <span className={cn(active ? "text-brand-cyan" : "text-slate-500")}>{icon}</span>
            {label}
        </Link>
    );
}
