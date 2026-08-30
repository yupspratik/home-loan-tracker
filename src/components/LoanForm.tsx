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
    <div className="bento-card p-6 mb-8 bg-white dark:bg-slate-900" id="loan-form">
      <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-dashed border-[var(--border-color)]">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Loan Parameters & Strategy</h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Configure principal, interest rate, tenure, and payoff strategy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Loan Amount */}
        <div>
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">
            Loan Amount (₹)
          </label>
          <input
            type="number"
            value={inputs.loanAmount}
            onChange={(e) => handleChange('loanAmount', Math.max(0, Number(e.target.value)))}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_var(--border-color)] transition-shadow"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.05"
            value={inputs.annualInterestRate}
            onChange={(e) => handleChange('annualInterestRate', Math.max(0, Number(e.target.value)))}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_var(--border-color)] transition-shadow"
          />
        </div>

        {/* Tenure Months */}
        <div>
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">
            Tenure (Months)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputs.tenureMonths}
              onChange={(e) => handleChange('tenureMonths', Math.max(1, Number(e.target.value)))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[2px_2px_0px_0px_var(--border-color)] transition-shadow"
            />
            <span className="text-xs font-bold text-slate-500 shrink-0">
              (~{(inputs.tenureMonths / 12).toFixed(1)} yrs)
            </span>
          </div>
        </div>

        {/* Start Month & Year */}
        <div>
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-2">
            Start Month & Year
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={inputs.startMonth || 1}
              onChange={(e) => handleChange('startMonth', Number(e.target.value))}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)] transition-shadow"
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
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)] transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="pt-5 border-t-2 border-dashed border-[var(--border-color)]">
        <label className="block text-sm font-black text-slate-800 dark:text-slate-200 mb-3">
          Prepayment & Rate Drop Strategy
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleChange('recalculationStrategy', 'REDUCE_TENURE')}
            className={`p-4 rounded-xl border-2 border-[var(--border-color)] text-left transition-all ${
              inputs.recalculationStrategy === 'REDUCE_TENURE' || !inputs.recalculationStrategy
                ? 'bg-[#A7F3D0] text-black shadow-[4px_4px_0px_0px_var(--border-color)] -translate-y-0.5'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--border-color)]'
            }`}
          >
            <div className={`font-black text-sm mb-1 ${inputs.recalculationStrategy === 'REDUCE_TENURE' || !inputs.recalculationStrategy ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>Reduce Tenure (Keep EMI Constant)</div>
            <div className={`text-xs font-medium ${inputs.recalculationStrategy === 'REDUCE_TENURE' || !inputs.recalculationStrategy ? 'text-slate-700' : 'text-slate-700 dark:text-slate-300'}`}>
              Lower rate / prepayments reduce total tenure and save maximum interest.
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChange('recalculationStrategy', 'REDUCE_EMI')}
            className={`p-4 rounded-xl border-2 border-[var(--border-color)] text-left transition-all ${
              inputs.recalculationStrategy === 'REDUCE_EMI'
                ? 'bg-[#A7F3D0] text-black shadow-[4px_4px_0px_0px_var(--border-color)] -translate-y-0.5'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--border-color)]'
            }`}
          >
            <div className={`font-black text-sm mb-1 ${inputs.recalculationStrategy === 'REDUCE_EMI' ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>Reduce Monthly EMI (Keep Tenure)</div>
            <div className={`text-xs font-medium ${inputs.recalculationStrategy === 'REDUCE_EMI' ? 'text-slate-700' : 'text-slate-700 dark:text-slate-300'}`}>
              Lower rate / prepayments reduce monthly EMI outflow while keeping original tenure.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
