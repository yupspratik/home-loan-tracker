'use client';

import {
  BalanceTransferInput,
  PrepayVsInvestInput,
  simulateBalanceTransfer,
  simulatePrepayVsInvest,
} from '@/lib/financial/simulator';
import { InterestRateChange } from '@/lib/financial/types';
import { ArrowRight, Calculator, CheckCircle2, DollarSign, HelpCircle, Layers, Lightbulb, Percent, RefreshCw, Scale, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface WhatIfSimulatorProps {
  currentLoanAmount: number;
  currentInterestRate: number;
  currentTenureMonths: number;
  rateChanges?: InterestRateChange[];
}

export function WhatIfSimulator({
  currentLoanAmount,
  currentInterestRate,
  currentTenureMonths,
  rateChanges = [],
}: WhatIfSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'PREPAY_VS_INVEST' | 'BALANCE_TRANSFER'>('PREPAY_VS_INVEST');

  // Compute latest active interest rate from rate revisions
  const latestActiveRate = useMemo(() => {
    if (!rateChanges || rateChanges.length === 0) return currentInterestRate || 8.5;
    const sorted = [...rateChanges].sort((a, b) => a.monthIndex - b.monthIndex);
    return sorted[sorted.length - 1].newAnnualRate;
  }, [currentInterestRate, rateChanges]);

  // Tab 1 state
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(500000);
  const [isMonthlySip, setIsMonthlySip] = useState<boolean>(false);
  const [expectedRoi, setExpectedRoi] = useState<number>(12);
  const [horizonYears, setHorizonYears] = useState<number>(Math.min(10, Math.ceil(currentTenureMonths / 12)));

  // Tab 2 state
  const [transferBalance, setTransferBalance] = useState<number>(currentLoanAmount || 4000000);
  const [transferCurrentRate, setTransferCurrentRate] = useState<number>(latestActiveRate);
  const [transferNewRate, setTransferNewRate] = useState<number>(Math.max(5, latestActiveRate - 0.5));
  const [transferTenureMonths, setTransferTenureMonths] = useState<number>(currentTenureMonths || 180);
  const [transferFeePercent, setTransferFeePercent] = useState<number>(0.5);
  const [transferFlatFee, setTransferFlatFee] = useState<number>(2500);

  // Sync state when latestActiveRate or currentLoanAmount updates
  useEffect(() => {
    setTransferCurrentRate(latestActiveRate);
    setTransferNewRate(Math.max(5, latestActiveRate - 0.5));
  }, [latestActiveRate]);

  useEffect(() => {
    if (currentLoanAmount > 0) setTransferBalance(currentLoanAmount);
  }, [currentLoanAmount]);

  const prepayResult = useMemo(() => {
    return simulatePrepayVsInvest({
      prepaymentAmount,
      isMonthlySip,
      loanInterestRate: latestActiveRate,
      expectedInvestmentRoi: expectedRoi,
      horizonYears,
    });
  }, [prepaymentAmount, isMonthlySip, latestActiveRate, expectedRoi, horizonYears]);

  const transferResult = useMemo(() => {
    return simulateBalanceTransfer({
      currentBalance: transferBalance,
      currentRate: transferCurrentRate,
      newRate: transferNewRate,
      remainingTenureMonths: transferTenureMonths,
      processingFeePercentage: transferFeePercent,
      flatProcessingFee: transferFlatFee,
    });
  }, [transferBalance, transferCurrentRate, transferNewRate, transferTenureMonths, transferFeePercent, transferFlatFee]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              "What-If" Decision Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Evaluate Prepaying vs. Investing in Mutual Funds, and calculate Home Loan Balance Transfer savings.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('PREPAY_VS_INVEST')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'PREPAY_VS_INVEST'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Prepay vs. Invest</span>
          </button>
          <button
            onClick={() => setActiveTab('BALANCE_TRANSFER')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'BALANCE_TRANSFER'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Balance Transfer</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Prepay vs Invest */}
      {activeTab === 'PREPAY_VS_INVEST' && (
        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Prepayment Amount (₹)
              </label>
              <input
                type="number"
                value={prepaymentAmount}
                onChange={(e) => setPrepaymentAmount(Math.max(1000, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Frequency
              </label>
              <select
                value={isMonthlySip ? 'MONTHLY' : 'LUMP_SUM'}
                onChange={(e) => setIsMonthlySip(e.target.value === 'MONTHLY')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="LUMP_SUM">One-Time Lump Sum</option>
                <option value="MONTHLY">Monthly Investment (SIP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Expected Investment ROI (% p.a.)
              </label>
              <input
                type="number"
                step="0.5"
                value={expectedRoi}
                onChange={(e) => setExpectedRoi(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Time Horizon (Years)
              </label>
              <input
                type="number"
                value={horizonYears}
                onChange={(e) => setHorizonYears(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option A: Prepay Loan */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Option A: Prepay Home Loan ({currentInterestRate}%)
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(prepayResult.guaranteedInterestSavedFromPrepayment)}
              </div>
              <div className="text-xs text-slate-400">Guaranteed Interest Cost Saved</div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                <span className="font-semibold text-emerald-400">100% Risk-Free Return:</span> Saves debt interest compounding at {currentInterestRate}% p.a. guaranteed.
              </div>
            </div>

            {/* Option B: Invest in Market */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Option B: Invest in Mutual Funds ({expectedRoi}%)
                </span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(prepayResult.investmentFutureValue)}
              </div>
              <div className="text-xs text-slate-400">Estimated Portfolio Value after {horizonYears} Years</div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                <span className="font-semibold text-indigo-400">Market Return:</span> Invested capital ({formatCurrency(prepayResult.totalPrepaymentInvested)}) compounding at {expectedRoi}% expected CAGR.
              </div>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-3 text-xs">
            <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-300 text-sm block mb-0.5">
                Recommendation: {prepayResult.recommendation === 'INVEST' ? 'Invest in Market' : prepayResult.recommendation === 'PREPAY' ? 'Prepay Loan First' : 'Balanced Approach'}
              </span>
              <p className="text-slate-300">{prepayResult.recommendationReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Balance Transfer */}
      {activeTab === 'BALANCE_TRANSFER' && (
        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Outstanding Balance (₹)</label>
              <input
                type="number"
                value={transferBalance}
                onChange={(e) => setTransferBalance(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Current Bank Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={transferCurrentRate}
                onChange={(e) => setTransferCurrentRate(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">New Bank Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={transferNewRate}
                onChange={(e) => setTransferNewRate(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Remaining Tenure (Months)</label>
              <input
                type="number"
                value={transferTenureMonths}
                onChange={(e) => setTransferTenureMonths(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Processing Fee (%)</label>
              <input
                type="number"
                step="0.1"
                value={transferFeePercent}
                onChange={(e) => setTransferFeePercent(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Flat Admin Fee (₹)</label>
              <input
                type="number"
                value={transferFlatFee}
                onChange={(e) => setTransferFlatFee(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Monthly EMI Reduction</span>
              <div className="text-xl font-bold text-emerald-400">
                {formatCurrency(transferResult.monthlyEmiSavings)} / mo
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Old: {formatCurrency(transferResult.currentEmi)} → New: {formatCurrency(transferResult.newEmi)}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Gross Interest Savings</span>
              <div className="text-xl font-bold text-blue-400">
                {formatCurrency(transferResult.totalGrossInterestSavings)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Over remaining {transferTenureMonths} months</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Total Transfer Cost</span>
              <div className="text-xl font-bold text-amber-400">
                {formatCurrency(transferResult.totalTransferCost)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Processing fee + admin charges</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Net Lifetime Savings</span>
              <div className={`text-xl font-bold ${transferResult.netLifetimeSavings > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(transferResult.netLifetimeSavings)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Payback period: ~{transferResult.paybackPeriodMonths} months
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
