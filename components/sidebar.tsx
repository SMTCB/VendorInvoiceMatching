'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings, ShieldCheck, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ user }: { user: any }) {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-brand-navy text-white flex-shrink-0 flex flex-col shadow-2xl shadow-brand-navy/50 z-30 h-screen sticky top-0">
            <div className="p-8 border-b border-white/5">
                <h2 className="text-white font-black text-xs uppercase tracking-[0.2em] leading-relaxed">
                    AP + AI
                    <span className="block text-[8px] text-slate-400 font-bold opacity-70 mt-1 uppercase tracking-widest leading-none">
                        Accounts Payable with Intelligence
                    </span>
                </h2>
                <p className="text-[10px] text-slate-500 mt-4 pl-1 font-black uppercase tracking-widest opacity-60">Enterprise AP Platform</p>
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

                <div className="pt-6 mt-6 border-t border-white/5">
                    <NavLink
                        href="/settings"
                        icon={<Settings size={18} />}
                        label="Security Settings"
                        active={pathname === "/settings"}
                    />
                </div>
            </nav>

            {/* Profile area can stay in layout or moved here */}
            <div className="mt-auto">
                {/* UserProfile will be passed or rendered here */}
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
