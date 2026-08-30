'use client';

import { Navbar } from '@/components/Navbar';
import { TaxCalculatorCard } from '@/components/TaxCalculatorCard';
import { useLoan } from '@/context/LoanContext';

export default function TaxStrategizerPage() {
  const { isLoaded, scheduleRows } = useLoan();

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans pb-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <TaxCalculatorCard rows={scheduleRows} />
      </div>
    </main>
  );
}
