'use client';

import { formatMonthLabel } from '@/lib/financial/emi';
import { PrepaymentFrequency, PrepaymentRule } from '@/lib/financial/types';
import { ArrowUpRight, Calendar, Plus, Trash2, Wallet } from 'lucide-react';
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
    setAmount(100000);
  };

  const handleDeleteRule = (id: string) => {
    onChange(prepayments.filter((r) => r.id !== id));
  };

  const frequencyLabels: Record<PrepaymentFrequency, string> = {
    ONE_TIME: 'One-Time Lump Sum',
    MONTHLY: 'Every Month',
    QUARTERLY: 'Every Quarter (3 Months)',
    HALF_YEARLY: 'Every Half Year (6 Months)',
    YEARLY: 'Every Year (12 Months)',
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Prepayment Schedule Manager</h2>
            <p className="text-xs text-slate-400">
              Add lump sum one-time or recurring prepayments to accelerate loan payoff.
            </p>
          </div>
        </div>
      </div>

      {/* Add Form */}
      <form id="form-add-prepayment" onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Frequency
          </label>
          <select
            id="input-prepayment-type"
            value={type}
            onChange={(e) => setType(e.target.value as PrepaymentFrequency)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-emerald-500"
          >
            <option value="ONE_TIME">One-Time</option>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="HALF_YEARLY">Half-Yearly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Amount (₹)
          </label>
          <input
            id="input-prepayment-amount"
            type="number"
            min="1000"
            step="5000"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Start Month
          </label>
          <input
            id="input-prepayment-start-month"
            type="number"
            min="1"
            max="600"
            value={startMonthIndex}
            onChange={(e) => setStartMonthIndex(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            End Month (Optional)
          </label>
          <input
            id="input-prepayment-end-month"
            type="number"
            min="1"
            max="600"
            placeholder="No Limit"
            value={endMonthIndex}
            onChange={(e) => setEndMonthIndex(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-emerald-500"
          />
        </div>

        <button
          id="btn-add-prepayment-rule"
          type="button"
          onClick={(e) => handleAddRule(e)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-md h-9"
        >
          <Plus className="w-4 h-4" />
          Add Prepayment
        </button>
      </form>

      {/* Rules list */}
      {prepayments.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
          No prepayments configured. Add one-time or recurring prepayments above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                className="flex items-center justify-between bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl hover:border-emerald-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {frequencyLabels[rule.type]}
                    </span>
                    <span className="text-sm font-bold text-white">
                      ₹{rule.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Starts: Month {rule.startMonthIndex} ({startLabel})
                    {rule.type !== 'ONE_TIME' && ` → Ends: ${endLabel}`}
                  </div>
                </div>
                <button
                  id={`btn-delete-prepayment-${rule.id}`}
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
