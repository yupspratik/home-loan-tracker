'use client';

import { AmortizationTable } from '@/components/AmortizationTable';
import { FinancialYearDashboard } from '@/components/FinancialYearDashboard';
import { LoanCharts } from '@/components/LoanCharts';
import { SummaryCards } from '@/components/SummaryCards';
import { calculateAmortization } from '@/lib/financial/calculator';
import { ActualPaymentLog, InterestRateChange, LoanInputs, PrepaymentRule } from '@/lib/financial/types';
import { DEFAULT_LOAN_STATE } from '@/lib/storage';
import { Building2, Eye, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useMemo, useState } from 'react';

export default function SharedDashboardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loanInputs, setLoanInputs] = useState<LoanInputs>(DEFAULT_LOAN_STATE.inputs);
  const [rateChanges, setRateChanges] = useState<InterestRateChange[]>(DEFAULT_LOAN_STATE.rateChanges);
  const [prepaymentRules, setPrepaymentRules] = useState<PrepaymentRule[]>(DEFAULT_LOAN_STATE.prepaymentRules);
  const [actualPaymentLogs, setActualPaymentLogs] = useState<ActualPaymentLog[]>(DEFAULT_LOAN_STATE.actualPaymentLogs);
  const [loanName, setLoanName] = useState<string>('LoanTracker Pro');

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.loanState) {
          setLoanInputs(data.loanState.inputs);
          setRateChanges(data.loanState.rateChanges || []);
          setPrepaymentRules(data.loanState.prepaymentRules || []);
          setActualPaymentLogs(data.loanState.actualPaymentLogs || []);
          if (data.loanState.name) setLoanName(data.loanState.name);
        }
      })
      .catch(() => {
        setError('Unable to load shared dashboard. Please check your internet connection.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const amortizationResult = useMemo(() => {
    return calculateAmortization(loanInputs, rateChanges, prepaymentRules, actualPaymentLogs);
  }, [loanInputs, rateChanges, prepaymentRules, actualPaymentLogs]);

  const scheduledEmi = useMemo(() => {
    return amortizationResult.rows.length > 0 ? amortizationResult.rows[0].scheduledEmi : 0;
  }, [amortizationResult]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading shared dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-lg font-bold text-white mb-2">Unable to Load Shared View</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <Link
            href="/"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl inline-block"
          >
            Go to LoanTracker Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white pb-16">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {/* Read Only Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{loanName}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Eye className="w-3 h-3" /> Shared Read-Only View
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                  <ShieldCheck className="w-3 h-3 text-blue-400" /> Verified Financial Statement
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Shared live home loan repayment schedule, financial year summary, interest breakdown, and forecast.
              </p>
            </div>
          </div>

          <div>
            <Link
              href="/"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-medium transition inline-block"
            >
              Open My Tracker
            </Link>
          </div>
        </header>

        {/* 1. Summary Cards */}
        <SummaryCards summary={amortizationResult.summary} scheduledEmi={scheduledEmi} />

        {/* 2. Financial Year View */}
        <FinancialYearDashboard rows={amortizationResult.rows} />

        {/* 3. Charts */}
        <LoanCharts rows={amortizationResult.rows} />

        {/* 4. Table */}
        <AmortizationTable rows={amortizationResult.rows} rateChanges={rateChanges} actualLogs={actualPaymentLogs} />
      </div>
    </main>
  );
}
