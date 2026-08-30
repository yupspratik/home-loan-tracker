'use client';

import { LoanInputs, RecalculationStrategy } from '@/lib/financial/types';
import React from 'react';

interface LoanFormProps {
  inputs: LoanInputs;
  onChange: (inputs: LoanInputs) => void;
}

export function LoanForm({ inputs, onChange }: LoanFormProps) {
  const handleChange = (field: keyof LoanInputs, value: any) => {
    onChange({
      ...inputs,
      [field]: value,
    });
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="bento-card p-6 mb-8">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Loan Parameters & Strategy</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure principal, interest rate, tenure, and payoff strategy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Loan Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Loan Amount (₹)
          </label>
          <input
            type="number"
            value={inputs.loanAmount}
            onChange={(e) => handleChange('loanAmount', Math.max(0, Number(e.target.value)))}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.05"
            value={inputs.annualInterestRate}
            onChange={(e) => handleChange('annualInterestRate', Math.max(0, Number(e.target.value)))}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
          />
        </div>

        {/* Tenure Months */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tenure (Months / Years)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputs.tenureMonths}
              onChange={(e) => handleChange('tenureMonths', Math.max(1, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
            />
            <span className="text-xs text-slate-500 shrink-0">
              (~{(inputs.tenureMonths / 12).toFixed(1)} yrs)
            </span>
          </div>
        </div>

        {/* Start Month & Year */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Start Month & Year
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={inputs.startMonth || 1}
              onChange={(e) => handleChange('startMonth', Number(e.target.value))}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={inputs.startYear || new Date().getFullYear()}
              onChange={(e) => handleChange('startYear', Number(e.target.value))}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Prepayment & Rate Drop Strategy
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleChange('recalculationStrategy', 'REDUCE_TENURE')}
            className={`p-3.5 rounded-xl border text-xs text-left transition ${
              inputs.recalculationStrategy === 'REDUCE_TENURE' || !inputs.recalculationStrategy
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400'
            }`}
          >
            <div className="font-bold mb-0.5">Reduce Tenure (Keep EMI Constant)</div>
            <div className="text-[11px] opacity-80">
              Lower rate / prepayments reduce total tenure and save maximum interest.
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChange('recalculationStrategy', 'REDUCE_EMI')}
            className={`p-3.5 rounded-xl border text-xs text-left transition ${
              inputs.recalculationStrategy === 'REDUCE_EMI'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400'
            }`}
          >
            <div className="font-bold mb-0.5">Reduce Monthly EMI (Keep Tenure)</div>
            <div className="text-[11px] opacity-80">
              Lower rate / prepayments reduce monthly EMI outflow while keeping original tenure.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
