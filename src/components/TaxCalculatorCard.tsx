'use client';

import { aggregateByFinancialYear } from '@/lib/financial/fyAggregator';
import { MonthlyScheduleRow } from '@/lib/financial/types';
import { calculateTaxDeductions } from '@/lib/financial/taxCalculator';
import { Award, ChevronDown, ChevronUp, FileText, IndianRupee, Info, ShieldAlert, Sparkles } from 'lucide-react';
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
    <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Income Tax Savings Estimator (Sec 24b & Sec 80C)
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {currentFyTax.fyLabel} Current FY
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Tax deductions on home loan interest (up to ₹2 Lakhs) and principal repayment (up to ₹1.5 Lakhs).
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center justify-center self-start sm:self-auto"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Current FY Quick Cards */}
      <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sec 24b Interest */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
            <span>Sec 24b Interest Deduction</span>
            <span className="text-[10px] text-slate-500">Max ₹2,00,000</span>
          </div>
          <div className="text-xl font-bold text-amber-400">
            {formatCurrency(currentFyTax.sec24bEligibleInterest)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Actual Interest: {formatCurrency(currentFyTax.totalInterestPaid)}
          </div>
        </div>

        {/* Sec 80C Principal */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
            <span>Sec 80C Principal Deduction</span>
            <span className="text-[10px] text-slate-500">Max ₹1,50,000</span>
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {formatCurrency(currentFyTax.sec80cEligiblePrincipal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Actual Principal: {formatCurrency(currentFyTax.totalPrincipalPaid)}
          </div>
        </div>

        {/* Total Old Regime Deduction */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-400 mb-1">Total Eligible Deduction</div>
          <div className="text-xl font-bold text-blue-400">
            {formatCurrency(currentFyTax.totalOldRegimeDeduction)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Under Old Tax Regime</div>
        </div>

        {/* Est. Tax Cash Saved */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-400 mb-1">Est. Tax Cash Saved (30% Slab)</div>
          <div className="text-xl font-bold text-emerald-400">
            {formatCurrency(currentFyTax.estimatedTaxSaved30Percent)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Including 4% health & education cess</div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            All Financial Years Tax Summary ({taxSummaries.length} FYs)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="p-3">Financial Year</th>
                  <th className="p-3 text-right">Interest Paid</th>
                  <th className="p-3 text-right">Sec 24b Interest</th>
                  <th className="p-3 text-right">Sec 80C Principal</th>
                  <th className="p-3 text-right">Total Deduction</th>
                  <th className="p-3 text-right">30% Slab Tax Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {taxSummaries.map((tax) => (
                  <tr key={tax.fyLabel} className="hover:bg-slate-950/50 transition">
                    <td className="p-3 font-bold font-sans text-white">{tax.fyLabel}</td>
                    <td className="p-3 text-right">{formatCurrency(tax.totalInterestPaid)}</td>
                    <td className="p-3 text-right text-amber-400">{formatCurrency(tax.sec24bEligibleInterest)}</td>
                    <td className="p-3 text-right text-emerald-400">{formatCurrency(tax.sec80cEligiblePrincipal)}</td>
                    <td className="p-3 text-right font-bold text-blue-400">{formatCurrency(tax.totalOldRegimeDeduction)}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">{formatCurrency(tax.estimatedTaxSaved30Percent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              Under the <span className="text-white font-medium">Old Tax Regime</span>, Section 24b allows up to ₹2,00,000 interest deduction for self-occupied property, and Section 80C allows up to ₹1,50,000 principal deduction. Under the <span className="text-white font-medium">New Tax Regime</span>, Section 24b is not applicable for self-occupied properties.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
