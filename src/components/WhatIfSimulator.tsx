'use client';

import {
  ASSET_CLASSES,
  AssetClass,
  simulateBalanceTransfer,
  simulatePrepayVsInvest,
} from '@/lib/financial/simulator';
import { InterestRateChange } from '@/lib/financial/types';
import { Calculator, CheckCircle2, RefreshCw, Scale, TrendingUp } from 'lucide-react';
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

  // Dynamically compute latest active interest rate from rate revisions
  const latestActiveRate = useMemo(() => {
    if (!rateChanges || rateChanges.length === 0) return currentInterestRate || 8.5;
    const sorted = [...rateChanges].sort((a, b) => a.monthIndex - b.monthIndex);
    return sorted[sorted.length - 1].newAnnualRate;
  }, [currentInterestRate, rateChanges]);

  // Tab 1 state
  const [selectedAsset, setSelectedAsset] = useState<AssetClass>('MUTUAL_FUND');
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(500000);
  const [isMonthlySip, setIsMonthlySip] = useState<boolean>(false);
  const [expectedRoi, setExpectedRoi] = useState<number>(ASSET_CLASSES.MUTUAL_FUND.defaultRoi);
  const [horizonYears, setHorizonYears] = useState<number>(Math.min(10, Math.max(1, Math.ceil(currentTenureMonths / 12))));

  // Tab 2 state
  const [transferBalance, setTransferBalance] = useState<number>(currentLoanAmount || 4000000);
  const [transferCurrentRate, setTransferCurrentRate] = useState<number>(latestActiveRate);
  const [transferNewRate, setTransferNewRate] = useState<number>(Math.max(5, latestActiveRate - 0.5));
  const [transferTenureMonths, setTransferTenureMonths] = useState<number>(currentTenureMonths || 180);
  const [transferFeePercent, setTransferFeePercent] = useState<number>(0.5);
  const [transferFlatFee, setTransferFlatFee] = useState<number>(2500);

  // Sync state when asset class or rate updates
  const handleAssetChange = (asset: AssetClass) => {
    setSelectedAsset(asset);
    setExpectedRoi(ASSET_CLASSES[asset].defaultRoi);
  };

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
      assetClass: selectedAsset,
    });
  }, [prepaymentAmount, isMonthlySip, latestActiveRate, expectedRoi, horizonYears, selectedAsset]);

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
    <section className="bento-card p-6 mb-8 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 border-indigo-200/50 dark:border-indigo-800/40">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            "What-If" Decision Simulator
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
              Active Rate: {latestActiveRate}%
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare prepaying loan vs investing in FDs, RDs, Stocks, Gold, Bonds, or Mutual Funds, and calculate Balance Transfer savings.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('PREPAY_VS_INVEST')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'PREPAY_VS_INVEST'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Prepay vs. Invest
          </button>
          <button
            onClick={() => setActiveTab('BALANCE_TRANSFER')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'BALANCE_TRANSFER'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Balance Transfer
          </button>
        </div>
      </div>

      {/* Tab 1: Prepay vs Invest */}
      {activeTab === 'PREPAY_VS_INVEST' && (
        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Investment Asset Class
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => handleAssetChange(e.target.value as AssetClass)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
              >
                {Object.values(ASSET_CLASSES).map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.defaultRoi}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Prepayment Amount (₹)
              </label>
              <input
                type="number"
                value={prepaymentAmount}
                onChange={(e) => setPrepaymentAmount(Math.max(1000, Number(e.target.value)))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Frequency
              </label>
              <select
                value={isMonthlySip ? 'MONTHLY' : 'LUMP_SUM'}
                onChange={(e) => setIsMonthlySip(e.target.value === 'MONTHLY')}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="LUMP_SUM">One-Time Lump Sum</option>
                <option value="MONTHLY">Monthly Extra (SIP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Expected Return (% p.a.)
              </label>
              <input
                type="number"
                step="0.5"
                value={expectedRoi}
                onChange={(e) => setExpectedRoi(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Time Horizon (Years)
              </label>
              <input
                type="number"
                value={horizonYears}
                onChange={(e) => setHorizonYears(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option A: Prepay Loan */}
            <div className="bento-card p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                Option A: Prepay Home Loan ({latestActiveRate}%)
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                {formatCurrency(prepayResult.guaranteedInterestSavedFromPrepayment)}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Guaranteed Risk-Free Interest Saved</div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 text-xs text-slate-600 dark:text-slate-300">
                Guaranteed 100% risk-free return of {latestActiveRate}% p.a.
              </div>
            </div>

            {/* Option B: Invest in Market */}
            <div className="bento-card p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/40">
              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2">
                Option B: Invest in {ASSET_CLASSES[selectedAsset].name} ({expectedRoi}%)
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                {formatCurrency(prepayResult.investmentFutureValue)}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Estimated Value after {horizonYears} Years</div>
              <div className="mt-4 pt-3 border-t border-indigo-200/60 dark:border-indigo-800/40 text-xs text-slate-600 dark:text-slate-300">
                Invested capital ({formatCurrency(prepayResult.totalPrepaymentInvested)}) compounding at {expectedRoi}%.
              </div>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl text-xs">
            <span className="font-bold text-indigo-900 dark:text-indigo-300 text-sm block mb-1">
              Recommendation: {prepayResult.recommendation === 'INVEST' ? `Invest in ${ASSET_CLASSES[selectedAsset].name}` : prepayResult.recommendation === 'PREPAY' ? 'Prepay Loan First' : 'Balanced Approach'}
            </span>
            <p className="text-slate-700 dark:text-slate-300">{prepayResult.recommendationReason}</p>
          </div>
        </div>
      )}

      {/* Tab 2: Balance Transfer */}
      {activeTab === 'BALANCE_TRANSFER' && (
        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Balance (₹)</label>
              <input
                type="number"
                value={transferBalance}
                onChange={(e) => setTransferBalance(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Bank Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={transferCurrentRate}
                onChange={(e) => setTransferCurrentRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Bank Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={transferNewRate}
                onChange={(e) => setTransferNewRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tenure (Months)</label>
              <input
                type="number"
                value={transferTenureMonths}
                onChange={(e) => setTransferTenureMonths(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Processing Fee (%)</label>
              <input
                type="number"
                step="0.1"
                value={transferFeePercent}
                onChange={(e) => setTransferFeePercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Admin Fee (₹)</label>
              <input
                type="number"
                value={transferFlatFee}
                onChange={(e) => setTransferFlatFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bento-card p-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Monthly EMI Reduction</span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(transferResult.monthlyEmiSavings)} / mo
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Old: {formatCurrency(transferResult.currentEmi)} → New: {formatCurrency(transferResult.newEmi)}
              </div>
            </div>

            <div className="bento-card p-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Gross Interest Savings</span>
              <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                {formatCurrency(transferResult.totalGrossInterestSavings)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Over remaining {transferTenureMonths} months</div>
            </div>

            <div className="bento-card p-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Transfer Cost</span>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {formatCurrency(transferResult.totalTransferCost)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Processing fee + admin charges</div>
            </div>

            <div className="bento-card p-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Net Lifetime Savings</span>
              <div className={`text-xl font-extrabold ${transferResult.netLifetimeSavings > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(transferResult.netLifetimeSavings)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Payback period: ~{transferResult.paybackPeriodMonths} months
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
