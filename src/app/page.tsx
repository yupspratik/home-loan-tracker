'use client';

import { AmortizationTable } from '@/components/AmortizationTable';
import { ExportImport } from '@/components/ExportImport';
import { LoanCharts } from '@/components/LoanCharts';
import { LoanForm } from '@/components/LoanForm';
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
import { Building2, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loanInputs, setLoanInputs] = useState<LoanInputs>(DEFAULT_LOAN_STATE.inputs);
  const [rateChanges, setRateChanges] = useState<InterestRateChange[]>(DEFAULT_LOAN_STATE.rateChanges);
  const [prepaymentRules, setPrepaymentRules] = useState<PrepaymentRule[]>(DEFAULT_LOAN_STATE.prepaymentRules);
  const [actualPaymentLogs, setActualPaymentLogs] = useState<ActualPaymentLog[]>(DEFAULT_LOAN_STATE.actualPaymentLogs);

  // Load saved state on client mount
  useEffect(() => {
    const saved = loadLoanStateFromStorage();
    setLoanInputs(saved.inputs);
    setRateChanges(saved.rateChanges);
    setPrepaymentRules(saved.prepaymentRules);
    setActualPaymentLogs(saved.actualPaymentLogs);
    setIsLoaded(true);
  }, []);

  // Save changes to local storage whenever updated
  useEffect(() => {
    if (!isLoaded) return;
    saveLoanStateToStorage({
      inputs: loanInputs,
      rateChanges,
      prepaymentRules,
      actualPaymentLogs,
    });
  }, [loanInputs, rateChanges, prepaymentRules, actualPaymentLogs, isLoaded]);

  // Compute amortization result dynamically
  const amortizationResult = useMemo(() => {
    return calculateAmortization(loanInputs, rateChanges, prepaymentRules, actualPaymentLogs);
  }, [loanInputs, rateChanges, prepaymentRules, actualPaymentLogs]);

  const scheduledEmi = useMemo(() => {
    return amortizationResult.rows.length > 0
      ? amortizationResult.rows[0].scheduledEmi
      : 0;
  }, [amortizationResult]);

  const handleImport = (importedState: SavedLoanState) => {
    setLoanInputs(importedState.inputs);
    setRateChanges(importedState.rateChanges || []);
    setPrepaymentRules(importedState.prepaymentRules || []);
    setActualPaymentLogs(importedState.actualPaymentLogs || []);
  };

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
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Home Loan Repayment & Forecast Tracker
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" /> Live Forecaster
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Track interest rate changes, schedule custom prepayments, log actual EMI payments, and project payoff timeline.
              </p>
            </div>
          </div>
        </header>

        {/* 1. Key Metrics Overview */}
        <SummaryCards summary={amortizationResult.summary} scheduledEmi={scheduledEmi} />

        {/* 2. Loan Input Setup */}
        <LoanForm inputs={loanInputs} onChange={setLoanInputs} />

        {/* 3. Interest Rate Revisions */}
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

        {/* 5. Interactive Analytics & Charts */}
        <LoanCharts rows={amortizationResult.rows} />

        {/* 6. Amortization Schedule Table */}
        <AmortizationTable
          rows={amortizationResult.rows}
          rateChanges={rateChanges}
          actualLogs={actualPaymentLogs}
          onUpdateRateChange={setRateChanges}
          onUpdateActualPaymentLog={setActualPaymentLogs}
        />

        {/* 7. Export & Backup Tools */}
        <ExportImport
          rows={amortizationResult.rows}
          loanState={{
            inputs: loanInputs,
            rateChanges,
            prepaymentRules,
            actualPaymentLogs,
          }}
          onImport={handleImport}
        />
      </div>
    </main>
  );
}
