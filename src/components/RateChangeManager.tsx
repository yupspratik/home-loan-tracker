'use client';

import { formatMonthLabel } from '@/lib/financial/emi';
import { InterestRateChange } from '@/lib/financial/types';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';

interface RateChangeManagerProps {
  rateChanges: InterestRateChange[];
  startYear: number;
  startMonth: number;
  onChange: (rateChanges: InterestRateChange[]) => void;
}

export function RateChangeManager({
  rateChanges,
  startYear,
  startMonth,
  onChange,
}: RateChangeManagerProps) {
  const [monthIndex, setMonthIndex] = useState<number>(13);
  const [newRate, setNewRate] = useState<number>(8.75);

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (monthIndex < 1 || newRate <= 0) return;

    // Filter out existing rate change for same month if adding
    const filtered = rateChanges.filter((rc) => rc.monthIndex !== monthIndex);
    const updated = [...filtered, { monthIndex, newAnnualRate: newRate }].sort(
      (a, b) => a.monthIndex - b.monthIndex
    );

    onChange(updated);
  };

  const handleDelete = (mIndex: number) => {
    onChange(rateChanges.filter((rc) => rc.monthIndex !== mIndex));
  };

  return (
    <div className="bento-card p-6 mb-8 bg-white dark:bg-slate-900" id="rate-revisions">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-dashed border-[var(--border-color)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#E0F2FE] border-2 border-[var(--border-color)] rounded-xl text-black shadow-[2px_2px_0px_0px_var(--border-color)]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Interest Rate Revisions</h2>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Specify interest rate changes for any month. The new rate will persist until updated again.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleAddOrUpdate} className="flex flex-wrap gap-4 items-end mb-6 bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border-2 border-[var(--border-color)]">
        <div>
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-1.5">
            Month Number (e.g. Month 13)
          </label>
          <input
            id="input-rate-change-month"
            type="number"
            min="1"
            max="600"
            value={monthIndex}
            onChange={(e) => setMonthIndex(parseInt(e.target.value) || 1)}
            className="w-36 bg-white dark:bg-slate-900 border-2 border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_var(--border-color)]"
          />
        </div>

        <div>
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-1.5">
            New Interest Rate (%)
          </label>
          <input
            id="input-rate-change-value"
            type="number"
            step="0.05"
            min="0.1"
            max="30"
            value={newRate}
            onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
            className="w-36 bg-white dark:bg-slate-900 border-2 border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_var(--border-color)]"
          />
        </div>

        <div className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center h-11 px-2">
          Effective Date:{' '}
          <span className="ml-1 text-black dark:text-white px-2 py-1 bg-[#FEF08A] dark:bg-blue-600 rounded-md border-2 border-[var(--border-color)]">
            {formatMonthLabel(monthIndex, startYear, startMonth).label}
          </span>
        </div>

        <button
          id="btn-add-rate-change"
          type="submit"
          className="flex items-center gap-2 bg-[#FEF08A] text-black font-black text-sm px-5 py-2.5 bento-button ml-auto hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Rate Revision
        </button>
      </form>

      {/* List of active rate changes */}
      {rateChanges.length === 0 ? (
        <div className="text-center py-8 text-sm font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-[var(--border-color)]">
          No rate revisions configured. The initial base interest rate applies throughout the loan tenure.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {rateChanges.map((rc) => {
            const label = formatMonthLabel(rc.monthIndex, startYear, startMonth).label;
            return (
              <div
                key={rc.monthIndex}
                className="flex items-center justify-between bg-white dark:bg-slate-800 border-2 border-[var(--border-color)] p-4 rounded-xl shadow-[2px_2px_0px_0px_var(--border-color)]"
              >
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Month {rc.monthIndex} ({label})
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {rc.newAnnualRate}% <span className="text-sm font-bold text-slate-500">Rate</span>
                  </div>
                </div>
                <button
                  id={`btn-delete-rate-change-${rc.monthIndex}`}
                  type="button"
                  onClick={() => handleDelete(rc.monthIndex)}
                  className="p-2 text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-100 dark:bg-slate-700 dark:hover:bg-red-900/30 rounded-lg border-2 border-transparent hover:border-red-500 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
