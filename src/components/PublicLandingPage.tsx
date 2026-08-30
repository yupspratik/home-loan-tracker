'use client';

import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, Calculator, Calendar, CheckCircle2, ChevronRight, FileText, Lock, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react';
import React, { useState } from 'react';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Bar Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              H
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              Home Loan Tracker
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onTryDemo}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Try Interactive Demo
            </button>
            <button
              onClick={handleGoogleLogin}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium mb-6">
          <span>Enterprise SaaS Loan Management & Wealth Simulator</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight mb-6">
          Take Complete Control of Your Home Loan Repayment & Future Wealth
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Forecast interest rate changes, calculate prepayments, compare paying off debt vs investing in FDs, Stocks, or Mutual Funds, and generate instant Financial Year statements.
        </p>

        {/* Auth CTA Form */}
        <div className="max-w-md mx-auto bento-card p-6 mb-12 text-left">
          {magicLinkSent ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 text-center font-medium">
              Magic link sent to <strong>{email}</strong>! Check your inbox to sign in instantly.
            </div>
          ) : (
            <>
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-900 dark:text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 mb-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-3 text-[11px] text-slate-400">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span>or passwordless magic link</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <form onSubmit={handleMagicLink} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition shrink-0"
                >
                  {loading ? 'Sending...' : 'Send Link'}
                </button>
              </form>
            </>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={onTryDemo}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Explore Interactive Demo (No Signup Required) →
            </button>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Common Home Loan Dilemmas Solved
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Why thousands of homeowners use our repayment intelligence engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bento-card p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
                1. Silent Rate Shifts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Floating interest rate changes quietly extend your tenure by 5 to 10 years without warning. Track every rate revision dynamically.
              </p>
            </div>

            <div className="bento-card p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
                2. Prepayment Strategy
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Wondering if paying ₹10,000 extra monthly or ₹1 Lakh annually saves more lakhs in interest? Test all prepayment frequencies instantly.
              </p>
            </div>

            <div className="bento-card p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
                3. Prepay vs. Invest
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Should you prepay your 8.5% loan or invest in FDs, Stocks, Gold, or Mutual Funds? Calculate exact net wealth gain before deciding.
              </p>
            </div>

            <div className="bento-card p-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
                4. Income Tax Deductions
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Struggling to compute Section 24b and Section 80C deductions for tax returns? Get formatted Financial Year (Apr-Mar) reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bento-card p-6 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
              Financial Year Statements
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Pre-formatted April to March financial year statement cards showing total principal, interest, lump sum prepayments, and excess EMI paid.
            </p>
          </div>

          <div className="bento-card p-6 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
              Multi-Asset Decision Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Compare prepaying debt against FDs, RDs, Direct Stocks, Gold, Bonds, or Mutual Funds with breakeven ROI benchmarks.
            </p>
          </div>

          <div className="bento-card p-6 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
              1-Click Share & PDF Export
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Generate a secure read-only URL to share your complete repayment dashboard with anyone, or print bank-ready PDF statements.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
