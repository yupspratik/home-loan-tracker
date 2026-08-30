'use client';

import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

interface PublicLandingPageProps {
  onTryDemo: () => void;
}

export function PublicLandingPage({ onTryDemo }: PublicLandingPageProps) {
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (!error) setMagicLinkSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden">
      {/* Top Bar Navigation */}
      <header className="border-b-4 border-[var(--border-color)] bg-[var(--bg-main)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-xl border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]">
              H
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
              LoanTracker Pro
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onTryDemo}
              className="hidden sm:block px-4 py-2.5 bg-[#FEF08A] text-black font-bold text-sm bento-button"
            >
              Try Interactive Demo
            </button>
            <button
              onClick={handleGoogleLogin}
              className="px-4 py-2.5 bg-blue-400 text-black font-bold text-sm bento-button flex items-center gap-2"
            >
              Sign In <span className="hidden sm:inline">with Google</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0F2FE] border-2 border-[var(--border-color)] text-black font-bold text-xs mb-8 shadow-[2px_2px_0px_0px_var(--border-color)]">
          <span>Enterprise SaaS Loan Management & Wealth Simulator</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-tight mb-8">
          Take Complete Control of Your Loan Repayment
        </h1>

        <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          Forecast interest rate changes, calculate prepayments, compare paying off debt vs investing in FDs, Stocks, or Mutual Funds, and generate instant Financial Year statements.
        </p>

        {/* Auth CTA Form */}
        <div className="max-w-md mx-auto bento-card p-8 mb-12 text-left bg-white dark:bg-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(226,232,240,1)]">
          {magicLinkSent ? (
            <div className="p-4 bg-[#D1FAE5] border-2 border-[var(--border-color)] rounded-xl text-sm text-black text-center font-bold shadow-[4px_4px_0px_0px_var(--border-color)]">
              Magic link sent to {email}! Check your inbox to sign in instantly.
            </div>
          ) : (
            <>
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-white text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 mb-4 bento-button"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-4 text-xs font-bold text-slate-400">
                <div className="flex-1 h-0.5 bg-[var(--border-color)] opacity-20" />
                <span>OR EMAIL LINK</span>
                <div className="flex-1 h-0.5 bg-[var(--border-color)] opacity-20" />
              </div>

              <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#A7F3D0] text-black font-black text-sm rounded-xl bento-button"
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-4 border-t-2 border-dashed border-[var(--border-color)] text-center">
            <button
              onClick={onTryDemo}
              className="text-sm text-slate-800 dark:text-slate-200 font-black hover:underline"
            >
              Explore Interactive Demo (No Signup) →
            </button>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 bg-[var(--bg-main)] border-t-4 border-[var(--border-color)] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              Common Loan Dilemmas Solved
            </h2>
            <p className="text-base font-bold text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Why thousands of users trust our repayment intelligence engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bento-card p-8 bg-rose-100 dark:bg-rose-950">
              <h3 className="font-black text-slate-900 dark:text-white text-lg mb-3">
                1. Silent Rate Shifts
              </h3>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-300 leading-relaxed">
                Floating interest rate changes quietly extend your tenure by 5 to 10 years without warning. Track every rate revision dynamically.
              </p>
            </div>

            <div className="bento-card p-8 bg-yellow-200 dark:bg-yellow-900">
              <h3 className="font-black text-slate-900 dark:text-white text-lg mb-3">
                2. Prepayment Strategy
              </h3>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-300 leading-relaxed">
                Wondering if paying ₹10,000 extra monthly or ₹1 Lakh annually saves more lakhs in interest? Test all prepayment frequencies instantly.
              </p>
            </div>

            <div className="bento-card p-8 bg-sky-100 dark:bg-sky-900">
              <h3 className="font-black text-slate-900 dark:text-white text-lg mb-3">
                3. Prepay vs. Invest
              </h3>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-300 leading-relaxed">
                Should you prepay your 8.5% loan or invest in FDs, Stocks, Gold, or Mutual Funds? Calculate exact net wealth gain before deciding.
              </p>
            </div>

            <div className="bento-card p-8 bg-emerald-100 dark:bg-emerald-950">
              <h3 className="font-black text-slate-900 dark:text-white text-lg mb-3">
                4. Income Tax Deductions
              </h3>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-300 leading-relaxed">
                Struggling to compute Section 24b and Section 80C deductions for tax returns? Get formatted Financial Year (Apr-Mar) reports.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
