import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, FileText, Settings, CreditCard, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AP + AI | Intelligent Invoice Matching",
  description: "AP + AI: Your Accounts Payable meet AI",
};

import { Logo } from "@/components/ui/logo";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex bg-[#F8FAFC]`}>
        {/* Premium Sidebar Navigation */}
        <aside className="w-64 bg-brand-navy text-white flex-shrink-0 flex flex-col shadow-2xl shadow-brand-navy/50 z-30">
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
            <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Controller" active />
            <NavLink href="/invoices" icon={<FileText size={18} />} label="Document Hub" />
            <NavLink href="/vendors" icon={<CreditCard size={18} />} label="Vendor Registry" />
            <NavLink href="/reports" icon={<PieChart size={18} />} label="Analysis" />

            <div className="pt-6 mt-6 border-t border-white/5">
              <NavLink href="/settings" icon={<Settings size={18} />} label="Security Settings" />
            </div>
          </nav>

          <div className="p-6 border-t border-white/5 bg-black/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center text-xs font-black shadow-lg shadow-brand-cyan/20">
                JD
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black truncate uppercase tracking-tight">John Doe</p>
                <p className="text-[10px] text-slate-400 truncate uppercase font-bold tracking-tighter">Chief Auditor</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden h-screen">
          <div className="flex-1 overflow-y-auto w-full">
            {children}
          </div>
        </main>
      </body>
    </html>
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
