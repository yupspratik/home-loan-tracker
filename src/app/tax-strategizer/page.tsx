'use client';

import { Navbar } from '@/components/Navbar';
import { TaxCalculatorCard } from '@/components/TaxCalculatorCard';
import { calculateAmortization } from '@/lib/financial/calculator';
import { ActualPaymentLog, InterestRateChange, LoanInputs, PrepaymentRule } from '@/lib/financial/types';
import { DEFAULT_LOAN_STATE, loadLoanStateFromStorage } from '@/lib/storage';
import { useEffect, useMemo, useState } from 'react';

export default function TaxStrategizerPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loanInputs, setLoanInputs] = useState<LoanInputs>(DEFAULT_LOAN_STATE.inputs);
  const [rateChanges, setRateChanges] = useState<InterestRateChange[]>(DEFAULT_LOAN_STATE.rateChanges);
  const [prepaymentRules, setPrepaymentRules] = useState<PrepaymentRule[]>(DEFAULT_LOAN_STATE.prepaymentRules);
  const [actualPaymentLogs, setActualPaymentLogs] = useState<ActualPaymentLog[]>(DEFAULT_LOAN_STATE.actualPaymentLogs);

  useEffect(() => {
    const saved = loadLoanStateFromStorage();
    setLoanInputs(saved.inputs);
    setRateChanges(saved.rateChanges || []);
    setPrepaymentRules(saved.prepaymentRules || []);
    setActualPaymentLogs(saved.actualPaymentLogs || []);
    setIsLoaded(true);
  }, []);

  const amortizationResult = useMemo(() => {
    return calculateAmortization(loanInputs, rateChanges, prepaymentRules, actualPaymentLogs);
  }, [loanInputs, rateChanges, prepaymentRules, actualPaymentLogs]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <TaxCalculatorCard rows={amortizationResult.rows} />
      </div>
    </main>
  );
}
