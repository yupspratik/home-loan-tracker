'use client';

import { formatMonthLabel } from '@/lib/financial/emi';
import { PrepaymentFrequency, PrepaymentRule } from '@/lib/financial/types';
import { ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface PrepaymentManagerProps {
  prepayments: PrepaymentRule[];
  startYear: number;
  startMonth: number;
  onChange: (rules: PrepaymentRule[]) => void;
}

export function PrepaymentManager({
  prepayments,
  startYear,
  startMonth,
  onChange,
}: PrepaymentManagerProps) {
  const [type, setType] = useState<PrepaymentFrequency>('ONE_TIME');
  const [amount, setAmount] = useState<number>(100000);
  const [startMonthIndex, setStartMonthIndex] = useState<number>(6);
  const [endMonthIndex, setEndMonthIndex] = useState<string>('');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount) || 0;
    const numStart = Number(startMonthIndex) || 1;
    if (numAmount <= 0 || numStart < 1) return;

    const newRule: PrepaymentRule = {
      id: `prepay-${Date.now()}`,
      type,
      amount: numAmount,
      startMonthIndex: numStart,
      endMonthIndex: endMonthIndex ? parseInt(endMonthIndex) : undefined,
    };

    onChange([...prepayments, newRule]);
  };

  const handleDeleteRule = (id: string) => {
    onChange(prepayments.filter((r) => r.id !== id));
  };

  const frequencyLabels: Record<PrepaymentFrequency, string> = {
    ONE_TIME: 'One-Time Lump Sum',
    MONTHLY: 'Every Month',
    QUARTERLY: 'Every Quarter',
    HALF_YEARLY: 'Every Half Year',
    YEARLY: 'Every Year',
  };

  return (
    <div className="bento-card p-6 mb-8 bg-white dark:bg-slate-900" id="prepayment-manager">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-dashed border-[var(--border-color)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#D1FAE5] border-2 border-[var(--border-color)] rounded-xl text-black shadow-[2px_2px_0px_0px_var(--border-color)]">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Prepayment Schedule</h2>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Add lump sum one-time or recurring prepayments to accelerate loan payoff.
            </p>
          </div>
        </div>
      </div>

      {/* Add Form */}
      <form id="form-add-prepayment" onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6 bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border-2 border-[var(--border-color)]">
        <div>
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-1.5">
            Frequency
          </label>
          <select
            id="input-prepayment-type"
            value={type}
            onChange={(e) => setType(e.target.value as PrepaymentFrequency)}
            className="w-full bg-white dark:bg-slate-900 border-2 border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_var(--border-color)]"
          >
            <option value="ONE_TIME">One-Time</option>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="HALF_YEARLY">Half-Yearly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-1.5">
            Amount (₹)
          </label>
          <input
            id="input-prepayment-amount"
            type="number"
            min="1000"
            step="5000"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full bg-white dark:bg-slate-900 border-2 border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_var(--border-color)]"
          />
        </div>

        <div>
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-1.5">
            Start Month
          </label>
          <input
            id="input-prepayment-start-month"
            type="number"
            min="1"
            max="600"
            value={startMonthIndex}
            onChange={(e) => setStartMonthIndex(parseInt(e.target.value) || 1)}
            className="w-full bg-white dark:bg-slate-900 border-2 border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_var(--border-color)]"
          />
        </div>

        <div>
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-1.5">
            End Month <span className="opacity-60 font-medium">(Optional)</span>
          </label>
          <input
            id="input-prepayment-end-month"
            type="number"
            min="1"
            max="600"
            placeholder="No Limit"
            value={endMonthIndex}
            onChange={(e) => setEndMonthIndex(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-2 border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 shadow-[2px_2px_0px_0px_var(--border-color)]"
          />
        </div>

        <button
          id="btn-add-prepayment-rule"
          type="button"
          onClick={(e) => handleAddRule(e)}
          className="flex items-center justify-center gap-2 bg-[#D1FAE5] text-black font-black text-sm px-4 py-2.5 bento-button h-11 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Rule
        </button>
      </form>

      {/* Rules list */}
      {prepayments.length === 0 ? (
        <div className="text-center py-8 text-sm font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-[var(--border-color)]">
          No prepayments configured. Add one-time or recurring prepayments above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prepayments.map((rule) => {
            const startLabel = formatMonthLabel(rule.startMonthIndex, startYear, startMonth).label;
            const endLabel = rule.endMonthIndex
              ? formatMonthLabel(rule.endMonthIndex, startYear, startMonth).label
              : 'End of Tenure';

            return (
              <div
                key={rule.id}
                id={`prepayment-rule-item-${rule.id}`}
                data-prepayment-type={rule.type}
                className="flex items-center justify-between bg-white dark:bg-slate-800 border-2 border-[var(--border-color)] p-4 rounded-xl shadow-[2px_2px_0px_0px_var(--border-color)]"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black px-2.5 py-1 rounded-md bg-[#D1FAE5] text-black border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]">
                      {frequencyLabels[rule.type]}
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ₹{rule.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Starts: Month {rule.startMonthIndex} ({startLabel})
                    {rule.type !== 'ONE_TIME' && ` → Ends: ${endLabel}`}
                  </div>
                </div>
                <button
                  id={`btn-delete-prepayment-${rule.id}`}
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
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
