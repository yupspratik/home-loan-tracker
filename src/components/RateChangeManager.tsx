'use client';

import { formatMonthLabel } from '@/lib/financial/emi';
import { InterestRateChange } from '@/lib/financial/types';
import { Edit3, Plus, Trash2, TrendingUp } from 'lucide-react';
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (monthIndex < 1 || newRate <= 0) return;

    // Filter out existing rate change for same month if adding
    const filtered = rateChanges.filter((rc) => rc.monthIndex !== monthIndex);
    const updated = [...filtered, { monthIndex, newAnnualRate: newRate }].sort(
      (a, b) => a.monthIndex - b.monthIndex
    );

    onChange(updated);
    setEditingIndex(null);
  };

  const handleDelete = (mIndex: number) => {
    onChange(rateChanges.filter((rc) => rc.monthIndex !== mIndex));
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Interest Rate Revision Manager</h2>
            <p className="text-xs text-slate-400">
              Specify interest rate changes for any month. The new rate will persist until updated again.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleAddOrUpdate} className="flex flex-wrap gap-4 items-end mb-6 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Month Number (e.g. Month 13)
          </label>
          <input
            id="input-rate-change-month"
            type="number"
            min="1"
            max="600"
            value={monthIndex}
            onChange={(e) => setMonthIndex(parseInt(e.target.value) || 1)}
            className="w-36 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
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
            className="w-36 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center h-10 px-2">
          Effective Date:{' '}
          <span className="ml-1 text-indigo-300 font-semibold">
            {formatMonthLabel(monthIndex, startYear, startMonth).label}
          </span>
        </div>

        <button
          id="btn-add-rate-change"
          type="submit"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-md ml-auto"
        >
          <Plus className="w-4 h-4" />
          Add Rate Revision
        </button>
      </form>

      {/* List of active rate changes */}
      {rateChanges.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
          No rate revisions configured. The initial base interest rate applies throughout the loan tenure.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {rateChanges.map((rc) => {
            const label = formatMonthLabel(rc.monthIndex, startYear, startMonth).label;
            return (
              <div
                key={rc.monthIndex}
                className="flex items-center justify-between bg-slate-800/60 border border-slate-700/70 p-3 rounded-xl hover:border-indigo-500/50 transition-all"
              >
                <div>
                  <div className="text-xs text-slate-400">
                    Month {rc.monthIndex} ({label})
                  </div>
                  <div className="text-sm font-bold text-indigo-400">
                    {rc.newAnnualRate}% Annual Rate
                  </div>
                </div>
                <button
                  id={`btn-delete-rate-change-${rc.monthIndex}`}
                  type="button"
                  onClick={() => handleDelete(rc.monthIndex)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
