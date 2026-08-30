'use client';

import { LoanCharts } from '@/components/LoanCharts';
import { LoanForm } from '@/components/LoanForm';
import { Navbar } from '@/components/Navbar';
import { PrepaymentManager } from '@/components/PrepaymentManager';
import { RateChangeManager } from '@/components/RateChangeManager';
import { SummaryCards } from '@/components/SummaryCards';
import { calculateAmortization } from '@/lib/financial/calculator';
import {
  ActualPaymentLog,
  InterestRateChange,
  LoanInputs,
  PrepaymentRule,
} from '@/lib/financial/types';
import {
  DEFAULT_LOAN_STATE,
  loadLoanStateFromStorage,
  SavedLoanState,
  saveLoanStateToStorage,
} from '@/lib/storage';
import { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isDbSynced, setIsDbSynced] = useState<boolean>(false);
  const [loanInputs, setLoanInputs] = useState<LoanInputs>(DEFAULT_LOAN_STATE.inputs);
  const [rateChanges, setRateChanges] = useState<InterestRateChange[]>(DEFAULT_LOAN_STATE.rateChanges);
  const [prepaymentRules, setPrepaymentRules] = useState<PrepaymentRule[]>(DEFAULT_LOAN_STATE.prepaymentRules);
  const [actualPaymentLogs, setActualPaymentLogs] = useState<ActualPaymentLog[]>(DEFAULT_LOAN_STATE.actualPaymentLogs);

  // Load saved state on client mount
  useEffect(() => {
    const saved = loadLoanStateFromStorage();
    setLoanInputs(saved.inputs);
    setRateChanges(saved.rateChanges || []);
    setPrepaymentRules(saved.prepaymentRules || []);
    setActualPaymentLogs(saved.actualPaymentLogs || []);
    setIsLoaded(true);

    // Sync with Supabase API backend if configured
    fetch('/api/loans')
      .then((res) => res.json())
      .then((data) => {
        if (data.isDbConfigured) {
          setIsDbSynced(true);
          if (data.loanState) {
            setLoanInputs(data.loanState.inputs);
            setRateChanges(data.loanState.rateChanges || []);
            setPrepaymentRules(data.loanState.prepaymentRules || []);
            setActualPaymentLogs(data.loanState.actualPaymentLogs || []);
          }
        }
      })
      .catch((err) => console.log('Browser storage mode active:', err));
  }, []);

  // Auto-save changes to local storage & Supabase API
  useEffect(() => {
    if (!isLoaded) return;

    const stateToSave: SavedLoanState = {
      inputs: loanInputs,
      rateChanges,
      prepaymentRules,
      actualPaymentLogs,
    };

    saveLoanStateToStorage(stateToSave);

    if (isDbSynced) {
      fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateToSave),
      }).catch((err) => console.error('Cloud sync error:', err));
    }
  }, [loanInputs, rateChanges, prepaymentRules, actualPaymentLogs, isLoaded, isDbSynced]);

  // Dynamic amortization computation
  const amortizationResult = useMemo(() => {
    return calculateAmortization(loanInputs, rateChanges, prepaymentRules, actualPaymentLogs);
  }, [loanInputs, rateChanges, prepaymentRules, actualPaymentLogs]);

  const scheduledEmi = useMemo(() => {
    return amortizationResult.rows.length > 0
      ? amortizationResult.rows[0].scheduledEmi
      : 0;
  }, [amortizationResult]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Home Loan Tracker...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white pb-16">
      {/* Navbar Menu Header */}
      <Navbar />

      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {/* 1. Dashboard Key Summary Metrics */}
        <SummaryCards summary={amortizationResult.summary} scheduledEmi={scheduledEmi} />

        {/* 2. Loan Input Setup & Strategy */}
        <LoanForm inputs={loanInputs} onChange={setLoanInputs} />

        {/* 3. Interest Rate Revisions Manager */}
        <RateChangeManager
          rateChanges={rateChanges}
          startYear={loanInputs.startYear || 2024}
          startMonth={loanInputs.startMonth || 1}
          onChange={setRateChanges}
        />

        {/* 4. Prepayment Manager */}
        <PrepaymentManager
          prepayments={prepaymentRules}
          startYear={loanInputs.startYear || 2024}
          startMonth={loanInputs.startMonth || 1}
          onChange={setPrepaymentRules}
        />

        {/* 5. Repayment Overview Analytics & Charts */}
        <LoanCharts rows={amortizationResult.rows} />
      </div>
    </main>
  );
}
