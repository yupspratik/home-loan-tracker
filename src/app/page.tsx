'use client';

import { LoanCharts } from '@/components/LoanCharts';
import { LoanForm } from '@/components/LoanForm';
import { Navbar } from '@/components/Navbar';
import { OnboardingTour } from '@/components/OnboardingTour';
import { PrepaymentManager } from '@/components/PrepaymentManager';
import { PublicLandingPage } from '@/components/PublicLandingPage';
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
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isDbSynced, setIsDbSynced] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const [loanInputs, setLoanInputs] = useState<LoanInputs>(DEFAULT_LOAN_STATE.inputs);
  const [rateChanges, setRateChanges] = useState<InterestRateChange[]>(DEFAULT_LOAN_STATE.rateChanges);
  const [prepaymentRules, setPrepaymentRules] = useState<PrepaymentRule[]>(DEFAULT_LOAN_STATE.prepaymentRules);
  const [actualPaymentLogs, setActualPaymentLogs] = useState<ActualPaymentLog[]>(DEFAULT_LOAN_STATE.actualPaymentLogs);

  // Check auth & load saved state
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

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

    return () => {
      authListener.subscription.unsubscribe();
    };
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Home Loan Tracker...</span>
        </div>
      </div>
    );
  }

  // Render Public Marketing Landing Page for unauthenticated visitors unless demo mode is triggered
  if (!user && !isDemoMode) {
    return <PublicLandingPage onTryDemo={() => setIsDemoMode(true)} />;
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white pb-16">
      {/* Onboarding Tour Guide */}
      <OnboardingTour />

      {/* Navbar Menu Header */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
