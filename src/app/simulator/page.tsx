'use client';

import { Navbar } from '@/components/Navbar';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { useLoan } from '@/context/LoanContext';

export default function SimulatorPage() {
  const { isLoaded, loanInputs, rateChanges, loanSummary, currentMonthIndex } = useLoan();

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans pb-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <WhatIfSimulator
          currentBalance={loanSummary?.currentBalance || loanInputs.loanAmount}
          currentInterestRate={loanInputs.annualInterestRate}
          currentTenureMonths={loanInputs.tenureMonths}
          rateChanges={rateChanges}
          currentMonthIndex={currentMonthIndex}
        />
      </div>
    </main>
  );
}
