'use client';

import { LoanSummary } from '@/lib/financial/types';
import { Calendar, CheckCircle2, DollarSign, Percent, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  summary: LoanSummary;
  scheduledEmi: number;
}

export function SummaryCards({ summary, scheduledEmi }: SummaryCardsProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Current Balance & Loan Amount */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Balance Left</span>
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div id="summary-balance-left" className="text-2xl font-bold text-white mb-1">
          {formatCurrency(summary.currentBalance)}
        </div>
        <p className="text-xs text-slate-400">
          Initial Loan: <span className="text-slate-300 font-semibold">{formatCurrency(summary.initialLoanAmount)}</span>
        </p>
      </div>

      {/* Monthly EMI & Interest Rate */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Monthly EMI</span>
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div id="summary-monthly-emi" className="text-2xl font-bold text-white mb-1">
          {formatCurrency(scheduledEmi)}
        </div>
        <p className="text-xs text-slate-400">
          Base Interest Rate: <span className="text-indigo-300 font-semibold">{summary.originalInterestRate}%</span>
        </p>
      </div>

      {/* Total Interest & Savings */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Total Interest</span>
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div id="summary-total-interest" className="text-2xl font-bold text-white mb-1">
          {formatCurrency(summary.actualTotalInterest)}
        </div>
        {summary.interestSaved > 0 ? (
          <div id="summary-interest-saved" className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved {formatCurrency(summary.interestSaved)} in interest!
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Original Total: <span className="text-slate-300 font-semibold">{formatCurrency(summary.originalTotalInterest)}</span>
          </p>
        )}
      </div>

      {/* Payoff Date & Months Saved */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Projected Payoff</span>
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div id="summary-projected-payoff" className="text-2xl font-bold text-amber-400 mb-1">
          {summary.projectedPayoffLabel}
        </div>
        {summary.monthsSaved > 0 ? (
          <div id="summary-months-saved" className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {summary.monthsSaved} months ({Math.floor(summary.monthsSaved / 12)}y {summary.monthsSaved % 12}m) earlier!
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Original Payoff: <span className="text-slate-300 font-semibold">{summary.originalPayoffLabel}</span>
          </p>
        )}
      </div>
    </div>
  );
}
