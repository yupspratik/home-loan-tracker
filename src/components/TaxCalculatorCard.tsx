'use client';

import { aggregateByFinancialYear } from '@/lib/financial/fyAggregator';
import { MonthlyScheduleRow } from '@/lib/financial/types';
import { calculateTaxDeductions } from '@/lib/financial/taxCalculator';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';

interface TaxCalculatorCardProps {
  rows: MonthlyScheduleRow[];
}

export function TaxCalculatorCard({ rows }: TaxCalculatorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const taxSummaries = useMemo(() => {
    const fyRows = aggregateByFinancialYear(rows);
    return calculateTaxDeductions(fyRows);
  }, [rows]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  if (taxSummaries.length === 0) return null;

  const currentFyTax = taxSummaries[0];

  return (
    <section className="bento-card p-6 mb-8 bg-white dark:bg-slate-900" id="tax-savings">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-[var(--border-color)]">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            Income Tax Savings Estimator (Sec 24b & Sec 80C)
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#FFE4E6] text-black border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]">
              {currentFyTax.fyLabel} Current FY
            </span>
          </h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
            Tax deductions on home loan interest (up to ₹2 Lakhs) and principal repayment (up to ₹1.5 Lakhs).
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-2 border-[var(--border-color)] rounded-xl shadow-[2px_2px_0px_0px_var(--border-color)] hover:-translate-y-0.5 transition-transform self-start sm:self-auto"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Current FY Quick Cards */}
      <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Sec 24b Interest */}
        <div className="bento-card p-5 bg-rose-100 dark:bg-rose-950">
          <div className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
            <span>Sec 24b Interest Deduction</span>
            <span className="text-xs text-slate-800 dark:text-slate-300 font-black">Max ₹2L</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {formatCurrency(currentFyTax.sec24bEligibleInterest)}
          </div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-2">
            Actual Interest: {formatCurrency(currentFyTax.totalInterestPaid)}
          </div>
        </div>

        {/* Sec 80C Principal */}
        <div className="bento-card p-5 bg-emerald-100 dark:bg-emerald-950">
          <div className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
            <span>Sec 80C Principal Deduction</span>
            <span className="text-xs text-slate-800 dark:text-slate-300 font-black">Max ₹1.5L</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {formatCurrency(currentFyTax.sec80cEligiblePrincipal)}
          </div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-2">
            Actual Principal: {formatCurrency(currentFyTax.totalPrincipalPaid)}
          </div>
        </div>

        {/* Total Old Regime Deduction */}
        <div className="bento-card p-5 bg-sky-100 dark:bg-sky-900">
          <div className="text-sm font-bold text-slate-900 dark:text-white mb-2">Total Eligible Deduction</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {formatCurrency(currentFyTax.totalOldRegimeDeduction)}
          </div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-2">Under Old Tax Regime</div>
        </div>

        {/* Est. Tax Cash Saved */}
        <div className="bento-card p-5 bg-yellow-200 dark:bg-yellow-900">
          <div className="text-sm font-bold text-slate-900 dark:text-white mb-2">Est. Tax Cash Saved (30% Slab)</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {formatCurrency(currentFyTax.estimatedTaxSaved30Percent)}
          </div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-2">Including 4% health & education cess</div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-8 pt-6 border-t-2 border-dashed border-[var(--border-color)] space-y-5">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            All Financial Years Tax Summary ({taxSummaries.length} FYs)
          </h3>

          <div className="overflow-x-auto rounded-xl border-2 border-[var(--border-color)] shadow-[4px_4px_0px_0px_var(--border-color)] bg-white dark:bg-slate-900">
            <table className="w-full text-sm text-left text-slate-900 dark:text-white">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b-2 border-[var(--border-color)] uppercase font-black text-xs">
                <tr>
                  <th className="p-4 border-r-2 border-[var(--border-color)] border-dashed">Financial Year</th>
                  <th className="p-4 text-right border-r-2 border-[var(--border-color)] border-dashed">Interest Paid</th>
                  <th className="p-4 text-right border-r-2 border-[var(--border-color)] border-dashed">Sec 24b Interest</th>
                  <th className="p-4 text-right border-r-2 border-[var(--border-color)] border-dashed">Sec 80C Principal</th>
                  <th className="p-4 text-right border-r-2 border-[var(--border-color)] border-dashed">Total Deduction</th>
                  <th className="p-4 text-right">30% Slab Tax Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--border-color)] font-mono font-bold">
                {taxSummaries.map((tax) => (
                  <tr key={tax.fyLabel} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-black font-sans text-slate-900 dark:text-white border-r-2 border-[var(--border-color)] border-dashed bg-[#FEF08A]/30">{tax.fyLabel}</td>
                    <td className="p-4 text-right border-r-2 border-[var(--border-color)] border-dashed">{formatCurrency(tax.totalInterestPaid)}</td>
                    <td className="p-4 text-right text-rose-600 border-r-2 border-[var(--border-color)] border-dashed">{formatCurrency(tax.sec24bEligibleInterest)}</td>
                    <td className="p-4 text-right text-emerald-600 border-r-2 border-[var(--border-color)] border-dashed">{formatCurrency(tax.sec80cEligiblePrincipal)}</td>
                    <td className="p-4 text-right font-black text-blue-600 border-r-2 border-[var(--border-color)] border-dashed">{formatCurrency(tax.totalOldRegimeDeduction)}</td>
                    <td className="p-4 text-right font-black text-emerald-600">{formatCurrency(tax.estimatedTaxSaved30Percent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
