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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Balance Left (Real-World As Of Current Month) */}
      <div className="bento-card p-5 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-200/50 dark:border-blue-800/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Balance Left to Pay</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
            {summary.currentAsOfLabel}
          </span>
        </div>
        <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
          {formatCurrency(summary.currentBalance)}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Initial: {formatCurrency(summary.initialLoanAmount)}
        </div>
      </div>

      {/* 2. Monthly EMI */}
      <div className="bento-card p-5">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          Scheduled Monthly EMI
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {formatCurrency(scheduledEmi)}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Base Interest Rate: {summary.originalInterestRate}% p.a.
        </div>
      </div>

      {/* 3. Interest Saved via Prepayment */}
      <div className="bento-card p-5 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-200/50 dark:border-emerald-800/40">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          Interest Saved
        </div>
        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(summary.interestSaved)}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {summary.monthsSaved > 0 ? `${summary.monthsSaved} Months Saved` : 'Standard Schedule'}
        </div>
      </div>

      {/* 4. Projected Payoff Target Date */}
      <div className="bento-card p-5">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          Projected Payoff Date
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {summary.projectedPayoffLabel}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Original Payoff: {summary.originalPayoffLabel}
        </div>
      </div>
    </div>
  );
}
