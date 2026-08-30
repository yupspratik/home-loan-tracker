'use client';

import { LoanSummary } from '@/lib/financial/types';
import React from 'react';

interface SummaryCardsProps {
  summary: LoanSummary;
  scheduledEmi: number;
}

export function SummaryCards({ summary, scheduledEmi }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="summary-cards">
      {/* 1. Balance Left (Real-World As Of Current Month) */}
      <div className="bento-card p-5 bg-[#E0F2FE]">
        <div className="flex flex-col items-start gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white">Balance Left to Pay</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold border-2 border-[var(--border-color)] shadow-sm">
            {summary.currentAsOfLabel}
          </span>
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
          {formatCurrency(summary.currentBalance)}
        </div>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-300">
          Initial: {formatCurrency(summary.initialLoanAmount)}
        </div>
      </div>

      {/* 2. Monthly EMI */}
      <div className="bento-card p-5 bg-[#FEF08A]">
        <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Scheduled Monthly EMI
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
          {formatCurrency(scheduledEmi)}
        </div>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-300">
          Base Interest Rate: {summary.originalInterestRate}% p.a.
        </div>
      </div>

      {/* 3. Interest Saved via Prepayment */}
      <div className="bento-card p-5 bg-[#D1FAE5]">
        <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Interest Saved
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
          {formatCurrency(summary.interestSaved)}
        </div>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-300">
          {summary.monthsSaved > 0 ? `${summary.monthsSaved} Months Saved` : 'Standard Schedule'}
        </div>
      </div>

      {/* 4. Projected Payoff Target Date */}
      <div className="bento-card p-5 bg-[#FFE4E6]">
        <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Projected Payoff Date
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
          {summary.projectedPayoffLabel}
        </div>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-300">
          Original Payoff: {summary.originalPayoffLabel}
        </div>
      </div>
    </div>
  );
}
