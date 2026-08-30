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
  currentBalance: number;
  currentInterestRate: number;
  currentTenureMonths: number;
  rateChanges?: InterestRateChange[];
  currentMonthIndex: number;
}

export function WhatIfSimulator({
  currentBalance,
  currentInterestRate,
  currentTenureMonths,
  rateChanges = [],
  currentMonthIndex,
}: WhatIfSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'PREPAY_VS_INVEST' | 'BALANCE_TRANSFER'>('PREPAY_VS_INVEST');

  // Dynamically compute latest active interest rate from rate revisions based on elapsed months
  const latestActiveRate = useMemo(() => {
    if (!rateChanges || rateChanges.length === 0) return currentInterestRate || 8.5;
    const pastChanges = rateChanges.filter(r => r.monthIndex <= currentMonthIndex);
    if (pastChanges.length === 0) return currentInterestRate;
    const sorted = [...pastChanges].sort((a, b) => a.monthIndex - b.monthIndex);
    return sorted[sorted.length - 1].newAnnualRate;
  }, [currentInterestRate, rateChanges, currentMonthIndex]);

  // Tab 1 state
  const [selectedAsset, setSelectedAsset] = useState<AssetClass>('MUTUAL_FUND');
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(500000);
  const [isMonthlySip, setIsMonthlySip] = useState<boolean>(false);
  const [expectedRoi, setExpectedRoi] = useState<number>(ASSET_CLASSES.MUTUAL_FUND.defaultRoi);
  const [horizonYears, setHorizonYears] = useState<number>(Math.min(10, Math.max(1, Math.ceil(currentTenureMonths / 12))));

  // Tab 2 state
  const [transferBalance, setTransferBalance] = useState<number>(currentBalance || 4000000);
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
    if (currentBalance > 0) setTransferBalance(currentBalance);
  }, [currentBalance]);

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
    <section className="bento-card p-6 mb-8 bg-white dark:bg-slate-900" id="decision-simulator">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-[var(--border-color)]">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            "What-If" Decision Simulator
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#E0F2FE] text-black border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]">
              Active Rate: {latestActiveRate}%
            </span>
          </h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
            Compare prepaying loan vs investing in FDs, RDs, Stocks, Gold, Bonds, or Mutual Funds, and calculate Balance Transfer savings.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-2xl shadow-[2px_2px_0px_0px_var(--border-color)]">
          <button
            onClick={() => setActiveTab('PREPAY_VS_INVEST')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              activeTab === 'PREPAY_VS_INVEST'
                ? 'bg-white dark:bg-slate-900 text-black dark:text-white shadow-sm border-2 border-[var(--border-color)]'
                : 'text-slate-600 dark:text-slate-400 border-2 border-transparent'
            }`}
          >
            Prepay vs. Invest
          </button>
          <button
            onClick={() => setActiveTab('BALANCE_TRANSFER')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              activeTab === 'BALANCE_TRANSFER'
                ? 'bg-white dark:bg-slate-900 text-black dark:text-white shadow-sm border-2 border-[var(--border-color)]'
                : 'text-slate-600 dark:text-slate-400 border-2 border-transparent'
            }`}
          >
            Balance Transfer
          </button>
        </div>
      </div>

      {/* Tab 1: Prepay vs Invest */}
      {activeTab === 'PREPAY_VS_INVEST' && (
        <div className="pt-6 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">
                Investment Asset Class
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => handleAssetChange(e.target.value as AssetClass)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              >
                {Object.values(ASSET_CLASSES).map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.defaultRoi}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">
                Prepayment Amount (₹)
              </label>
              <input
                type="number"
                value={prepaymentAmount}
                onChange={(e) => setPrepaymentAmount(Math.max(1000, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">
                Frequency
              </label>
              <select
                value={isMonthlySip ? 'MONTHLY' : 'LUMP_SUM'}
                onChange={(e) => setIsMonthlySip(e.target.value === 'MONTHLY')}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              >
                <option value="LUMP_SUM">One-Time Lump Sum</option>
                <option value="MONTHLY">Monthly Extra (SIP)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">
                Expected Return (% p.a.)
              </label>
              <input
                type="number"
                step="0.5"
                value={expectedRoi}
                onChange={(e) => setExpectedRoi(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">
                Time Horizon (Years)
              </label>
              <input
                type="number"
                value={horizonYears}
                onChange={(e) => setHorizonYears(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              />
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Option A: Prepay Loan */}
            <div className="bento-card p-6 bg-[#D1FAE5]">
              <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Option A: Prepay Home Loan ({latestActiveRate}%)
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                {formatCurrency(prepayResult.guaranteedInterestSavedFromPrepayment)}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-300">Guaranteed Risk-Free Interest Saved</div>
              <div className="mt-5 pt-4 border-t-2 border-[var(--border-color)] border-dashed text-sm font-bold text-slate-800 dark:text-slate-300">
                Guaranteed 100% risk-free return of {latestActiveRate}% p.a.
              </div>
            </div>

            {/* Option B: Invest in Market */}
            <div className="bento-card p-6 bg-[#E0F2FE]">
              <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Option B: Invest in {ASSET_CLASSES[selectedAsset].name} ({expectedRoi}%)
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                {formatCurrency(prepayResult.investmentFutureValue)}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-300">Estimated Value after {horizonYears} Years</div>
              <div className="mt-5 pt-4 border-t-2 border-[var(--border-color)] border-dashed text-sm font-bold text-slate-800 dark:text-slate-300">
                Invested capital ({formatCurrency(prepayResult.totalPrepaymentInvested)}) compounding at {expectedRoi}%.
              </div>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="p-5 bg-white dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl shadow-[4px_4px_0px_0px_var(--border-color)]">
            <span className="font-black text-slate-900 dark:text-white text-lg block mb-2">
              💡 Recommendation: <span className="text-blue-600">{prepayResult.recommendation === 'INVEST' ? `Invest in ${ASSET_CLASSES[selectedAsset].name}` : prepayResult.recommendation === 'PREPAY' ? 'Prepay Loan First' : 'Balanced Approach'}</span>
            </span>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{prepayResult.recommendationReason}</p>
          </div>
        </div>
      )}

      {/* Tab 2: Balance Transfer */}
      {activeTab === 'BALANCE_TRANSFER' && (
        <div className="pt-6 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">Balance (₹)</label>
              <input
                type="number"
                value={transferBalance}
                onChange={(e) => setTransferBalance(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">Current Bank Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={transferCurrentRate}
                onChange={(e) => setTransferCurrentRate(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">New Bank Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={transferNewRate}
                onChange={(e) => setTransferNewRate(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">Tenure (Months)</label>
              <input
                type="number"
                value={transferTenureMonths}
                onChange={(e) => setTransferTenureMonths(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">Processing Fee (%)</label>
              <input
                type="number"
                step="0.1"
                value={transferFeePercent}
                onChange={(e) => setTransferFeePercent(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">Admin Fee (₹)</label>
              <input
                type="number"
                value={transferFlatFee}
                onChange={(e) => setTransferFlatFee(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bento-card p-5 bg-[#E0F2FE]">
              <span className="text-sm font-bold text-slate-900 dark:text-white block mb-2">Monthly EMI Reduction</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                {formatCurrency(transferResult.monthlyEmiSavings)} <span className="text-lg">/ mo</span>
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-2">
                Old: {formatCurrency(transferResult.currentEmi)} → New: {formatCurrency(transferResult.newEmi)}
              </div>
            </div>

            <div className="bento-card p-5 bg-[#D1FAE5]">
              <span className="text-sm font-bold text-slate-900 dark:text-white block mb-2">Gross Interest Savings</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                {formatCurrency(transferResult.totalGrossInterestSavings)}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-2">Over remaining {transferTenureMonths} months</div>
            </div>

            <div className="bento-card p-5 bg-[#FFE4E6]">
              <span className="text-sm font-bold text-slate-900 dark:text-white block mb-2">Total Transfer Cost</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                {formatCurrency(transferResult.totalTransferCost)}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-2">Processing fee + admin charges</div>
            </div>

            <div className="bento-card p-5 bg-[#FEF08A]">
              <span className="text-sm font-bold text-slate-900 dark:text-white block mb-2">Net Lifetime Savings</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                {formatCurrency(transferResult.netLifetimeSavings)}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-2">
                Payback period: ~{transferResult.paybackPeriodMonths} months
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
