'use client';

import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthModal } from './AuthModal';
import { ShareModal } from './ShareModal';

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'FY Breakdown', href: '/fy-breakdown' },
    { name: 'Decision Simulator', href: '/simulator' },
    { name: 'Tax Strategizer', href: '/tax-strategizer' },
    { name: 'Schedule', href: '/schedule' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-main)] border-b-4 border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm">
              H
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white hidden sm:inline">
              LoanTracker Pro
            </span>
          </Link>

          {/* Navigation Menu Tabs */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-transform ${
                    isActive
                      ? 'bg-[#FEF08A] dark:bg-blue-600 text-black dark:text-white border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]'
                      : 'text-slate-700 dark:text-slate-300 hover:-translate-y-0.5'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-[var(--bg-card)] text-slate-800 dark:text-slate-200 border-2 border-[var(--border-color)] rounded-xl shadow-[2px_2px_0px_0px_var(--border-color)] hover:-translate-y-0.5 transition-transform hidden sm:block"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            <AuthModal />
            <ShareModal />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex flex-wrap justify-center items-center gap-3 py-3 border-t-2 border-[var(--border-color)] px-4 bg-[var(--bg-main)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-transform ${
                  isActive 
                    ? 'bg-[#FEF08A] dark:bg-blue-600 text-black dark:text-white border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
