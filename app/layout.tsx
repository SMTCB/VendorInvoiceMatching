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

import { createClient } from "@/lib/supabase/server";
import { UserProfile } from "@/components/user-profile";
import { Sidebar } from "@/components/sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex bg-[#F8FAFC]`}>
        {/* Premium Sidebar Navigation - Only show if authenticated */}
        {user && (
          <div className="flex-shrink-0">
            <Sidebar user={user} />
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden h-screen w-full">
          <div className="flex-1 overflow-y-auto w-full">
            {children}
          </div>
          {/* Keep User Profile floating or at bottom of sidebar */}
          {user && (
            <div className="absolute bottom-6 left-6 w-52 z-40 bg-brand-navy rounded-xl">
              <UserProfile user={user} />
            </div>
          )}
        </main>
      </body>
    </html>
  );
}
