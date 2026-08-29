'use client';

import { LoanInputs, RecalculationStrategy } from '@/lib/financial/types';
import { Calculator, Calendar, CalendarDays, Coins, Percent, RefreshCw } from 'lucide-react';
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
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Loan Setup & Strategy</h2>
          <p className="text-xs text-slate-400">Configure your primary loan parameters, start date, and prepayment impact strategy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Loan Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-blue-400" />
            Loan Amount (₹)
          </label>
          <input
            id="input-loan-amount"
            type="number"
            min="1000"
            step="50000"
            value={inputs.loanAmount}
            onChange={(e) => handleChange('loanAmount', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-800/80 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white transition-all outline-none"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-indigo-400" />
            Annual Interest Rate (%)
          </label>
          <input
            id="input-interest-rate"
            type="number"
            min="0.1"
            max="30"
            step="0.05"
            value={inputs.annualInterestRate}
            onChange={(e) => handleChange('annualInterestRate', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-800/80 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white transition-all outline-none"
          />
        </div>

        {/* Tenure Months / Years */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Tenure (Years)
          </label>
          <div className="flex gap-2">
            <input
              id="input-tenure-years"
              type="number"
              min="1"
              max="40"
              step="1"
              value={Math.round(inputs.tenureMonths / 12)}
              onChange={(e) => handleChange('tenureMonths', (parseInt(e.target.value) || 1) * 12)}
              className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white transition-all outline-none"
            />
            <div className="flex items-center px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-400">
              {inputs.tenureMonths}m
            </div>
          </div>
        </div>

        {/* Loan Start Date (Month & Year) */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-purple-400" />
            Start Date (Month / Year)
          </label>
          <div className="flex gap-2">
            <select
              id="input-start-month"
              value={inputs.startMonth || 1}
              onChange={(e) => handleChange('startMonth', parseInt(e.target.value) || 1)}
              className="w-1/2 bg-slate-800/80 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-white transition-all outline-none cursor-pointer"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label.slice(0, 3)}
                </option>
              ))}
            </select>
            <input
              id="input-start-year"
              type="number"
              min="2000"
              max="2060"
              step="1"
              value={inputs.startYear || new Date().getFullYear()}
              onChange={(e) => handleChange('startYear', parseInt(e.target.value) || 2024)}
              className="w-1/2 bg-slate-800/80 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-white transition-all outline-none"
            />
          </div>
        </div>

        {/* Prepayment Recalculation Strategy */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            Prepayment Strategy
          </label>
          <select
            id="input-recalculation-strategy"
            value={inputs.recalculationStrategy || 'REDUCE_TENURE'}
            onChange={(e) => handleChange('recalculationStrategy', e.target.value as RecalculationStrategy)}
            className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white transition-all outline-none cursor-pointer"
          >
            <option value="REDUCE_TENURE">Reduce Tenure (Keep EMI constant)</option>
            <option value="REDUCE_EMI">Reduce Monthly EMI (Keep Tenure)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
