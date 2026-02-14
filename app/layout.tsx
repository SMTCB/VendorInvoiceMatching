import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, FileText, Settings, CreditCard, PieChart } from "lucide-react";

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
      <body className={`${inter.variable} antialiased min-h-screen flex`}>
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <Logo showText={true} className="text-white [&_span]:text-white" />
            <p className="text-xs text-slate-400 mt-2 pl-1">Your Accounts Payable meet AI</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" active />
            <NavLink href="/invoices" icon={<FileText size={18} />} label="All Invoices" />
            <NavLink href="/vendors" icon={<CreditCard size={18} />} label="Vendors" />
            <NavLink href="/reports" icon={<PieChart size={18} />} label="Reports" />
            <div className="pt-4 mt-4 border-t border-slate-800">
              <NavLink href="/settings" icon={<Settings size={18} />} label="Settings" />
            </div>
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                JD
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-slate-400 truncate">AP Manager</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-slate-50 relative overflow-y-auto h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

function NavLink({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
        ? "bg-slate-800 text-white"
        : "text-slate-400 hover:text-white hover:bg-slate-800"
        }`}
    >
      {icon}
      {label}
    </Link>
  );
}
