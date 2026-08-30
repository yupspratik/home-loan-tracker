'use client';

import { LoanCharts } from '@/components/LoanCharts';
import { LoanForm } from '@/components/LoanForm';
import { PrepaymentManager } from '@/components/PrepaymentManager';
import { RateChangeManager } from '@/components/RateChangeManager';
import { SummaryCards } from '@/components/SummaryCards';
import { useLoan } from '@/context/LoanContext';
import { useMemo } from 'react';
import { PublicLandingPage } from '@/components/PublicLandingPage';
import { OnboardingTour } from '@/components/OnboardingTour';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  const {
    isLoaded,
    user,
    isDemoMode,
    setIsDemoMode,
    loanInputs,
    setLoanInputs,
    rateChanges,
    setRateChanges,
    prepaymentRules,
    setPrepaymentRules,
    actualPaymentLogs,
    loanSummary,
    scheduleRows,
  } = useLoan();

  const scheduledEmi = useMemo(() => {
    return scheduleRows && scheduleRows.length > 0
      ? scheduleRows[0].scheduledEmi
      : 0;
  }, [scheduleRows]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold">Loading LoanTracker Pro...</span>
        </div>
      </div>
    );
  }

  // Render Public Marketing Landing Page for unauthenticated visitors unless demo mode is triggered
  if (!user && !isDemoMode) {
    return <PublicLandingPage onTryDemo={() => setIsDemoMode(true)} />;
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-blue-500 selection:text-white pb-16">
      {/* Onboarding Tour Guide */}
      <OnboardingTour />

      {/* Navbar Menu Header */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 1. Dashboard Key Summary Metrics */}
        <SummaryCards summary={loanSummary} scheduledEmi={scheduledEmi} />

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
        <LoanCharts rows={scheduleRows} />
      </div>
    </main>
  );
}
