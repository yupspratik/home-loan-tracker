'use client';

import { Navbar } from '@/components/Navbar';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { ActualPaymentLog, InterestRateChange, LoanInputs, PrepaymentRule } from '@/lib/financial/types';
import { DEFAULT_LOAN_STATE, loadLoanStateFromStorage } from '@/lib/storage';
import { useEffect, useState } from 'react';

export default function SimulatorPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loanInputs, setLoanInputs] = useState<LoanInputs>(DEFAULT_LOAN_STATE.inputs);
  const [rateChanges, setRateChanges] = useState<InterestRateChange[]>(DEFAULT_LOAN_STATE.rateChanges);

  useEffect(() => {
    const saved = loadLoanStateFromStorage();
    setLoanInputs(saved.inputs);
    setRateChanges(saved.rateChanges || []);
    setIsLoaded(true);
  }, []);

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
        <WhatIfSimulator
          currentLoanAmount={loanInputs.loanAmount}
          currentInterestRate={loanInputs.annualInterestRate}
          currentTenureMonths={loanInputs.tenureMonths}
          rateChanges={rateChanges}
        />
      </div>
    </main>
  );
}
