'use client';

import { Building2, Calendar, Calculator, FileText, LayoutDashboard, Table, User, LogOut, Plus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PdfExportButton } from './PdfExportButton';
import { ShareModal } from './ShareModal';
import { AuthModal } from './AuthModal';
import { PortfolioSelector } from './PortfolioSelector';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'FY Breakdown', href: '/fy-breakdown', icon: Calendar },
    { name: 'Decision Simulator', href: '/simulator', icon: Calculator },
    { name: 'Tax Strategizer', href: '/tax-strategizer', icon: FileText },
    { name: 'Schedule', href: '/schedule', icon: Table },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                Home Loan Tracker
              </span>
              <span className="text-[10px] text-slate-400 block leading-none">Repayment & Forecast</span>
            </div>
          </Link>

          {/* Navigation Menu Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 border border-slate-800/80 rounded-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Header Controls */}
          <div className="flex items-center gap-2">
            <PortfolioSelector />
            <AuthModal />
            <PdfExportButton />
            <ShareModal />
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-medium ${
                  isActive ? 'text-blue-400 bg-blue-500/10 font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
