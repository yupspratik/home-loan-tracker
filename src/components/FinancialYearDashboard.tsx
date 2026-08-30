'use client';

import { aggregateByFinancialYear, FinancialYearRow } from '@/lib/financial/fyAggregator';
import { MonthlyScheduleRow } from '@/lib/financial/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface FinancialYearDashboardProps {
  rows: MonthlyScheduleRow[];
}

export function FinancialYearDashboard({ rows }: FinancialYearDashboardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedFyFilter, setSelectedFyFilter] = useState<string>('ALL');

  const fyRows = useMemo(() => {
    return aggregateByFinancialYear(rows);
  }, [rows]);

  const totals = useMemo(() => {
    return fyRows.reduce(
      (acc, fy) => {
        acc.lumpsum += fy.totalLumpsumPrepayment;
        acc.excessMonthly += fy.totalExcessMonthlyPrepayment;
        acc.interest += fy.totalInterestPaid;
        acc.principal += fy.totalPrincipalPaid;
        acc.totalPayments += fy.totalPaymentMade;
        return acc;
      },
      { lumpsum: 0, excessMonthly: 0, interest: 0, principal: 0, totalPayments: 0 }
    );
  }, [fyRows]);

  const chartData = useMemo(() => {
    return fyRows.map((fy) => ({
      fyLabel: fy.fyLabel,
      'Principal Paid': fy.totalScheduledPrincipalPaid,
      'Interest Paid': fy.totalInterestPaid,
      'Lumpsum Prepayments': fy.totalLumpsumPrepayment,
      'Excess EMI Prepayments': fy.totalExcessMonthlyPrepayment,
    }));
  }, [fyRows]);

  const filteredFyRows = useMemo(() => {
    if (selectedFyFilter === 'ALL') return fyRows;
    return fyRows.filter((fy) => fy.fyLabel === selectedFyFilter);
  }, [fyRows, selectedFyFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (fyRows.length === 0) return null;

  return (
    <section className="bento-card p-6 mb-8 bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-[var(--border-color)]">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            Financial Year Statement (Apr – Mar)
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#E0F2FE] text-black border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]">
              {fyRows.length} FY Periods
            </span>
          </h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
            Annual summary of interest, principal, lump sum prepayments, and excess monthly EMI payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFyFilter}
            onChange={(e) => setSelectedFyFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)]"
          >
            <option value="ALL">All Financial Years</option>
            {fyRows.map((fy) => (
              <option key={fy.fyLabel} value={fy.fyLabel}>
                {fy.fyLabel} ({fy.startMonthLabel} - {fy.endMonthLabel})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-2 border-[var(--border-color)] rounded-xl shadow-[2px_2px_0px_0px_var(--border-color)] hover:-translate-y-0.5 transition-transform"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-6 space-y-8">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Lumpsum */}
            <div className="bento-card p-5 bg-[#D1FAE5]">
              <span className="text-sm font-bold text-slate-900 dark:text-white block mb-2">
                Lump Sum Prepayments
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                {formatCurrency(totals.lumpsum)}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-300">One-time & periodic prepayments</div>
            </div>

            {/* Excess Monthly */}
            <div className="bento-card p-5 bg-[#E0F2FE]">
              <span className="text-sm font-bold text-slate-900 dark:text-white block mb-2">
                Excess EMI Prepayments
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                {formatCurrency(totals.excessMonthly)}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-300">Paid EMI exceeding scheduled EMI</div>
            </div>

            {/* Interest Paid */}
            <div className="bento-card p-5 bg-[#FFE4E6]">
              <span className="text-sm font-bold text-slate-900 dark:text-white block mb-2">
                Total FY Interest Paid
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                {formatCurrency(totals.interest)}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-300">Cumulative interest paid</div>
            </div>

            {/* Principal Paid */}
            <div className="bento-card p-5 bg-[#FEF08A]">
              <span className="text-sm font-bold text-slate-900 dark:text-white block mb-2">
                Total FY Principal Paid
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                {formatCurrency(totals.principal)}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-300">Scheduled principal + prepayments</div>
            </div>
          </div>

          {/* Visual Stacked Bar Chart */}
          <div className="bento-card p-6 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">
              Year-on-Year Repayment Distribution
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.2} vertical={false} />
                  <XAxis dataKey="fyLabel" stroke="currentColor" fontSize={11} className="font-bold text-slate-500" />
                  <YAxis stroke="currentColor" fontSize={11} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} className="font-bold text-slate-500" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      borderWidth: '2px',
                      borderRadius: '0.75rem',
                      boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '16px' }} />
                  <Bar dataKey="Principal Paid" fill="#3b82f6" radius={[4, 4, 4, 4]} stackId="a" />
                  <Bar dataKey="Interest Paid" fill="#f43f5e" radius={[4, 4, 4, 4]} stackId="a" />
                  <Bar dataKey="Lumpsum Prepayments" fill="#10b981" radius={[4, 4, 4, 4]} stackId="b" />
                  <Bar dataKey="Excess EMI Prepayments" fill="#06b6d4" radius={[4, 4, 4, 4]} stackId="b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed FY Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Financial Year Statement Breakdown ({filteredFyRows.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredFyRows.map((fy) => (
                <div key={fy.fyLabel} className="bento-card p-6 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-dashed border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900 dark:text-white text-lg">{fy.fyLabel}</span>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-[#FEF08A] text-black border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)] font-bold">
                        {fy.startMonthLabel} – {fy.endMonthLabel} ({fy.monthsCount}m)
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 font-mono">
                      End: {formatCurrency(fy.closingBalance)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl shadow-[2px_2px_0px_0px_var(--border-color)]">
                      <span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Interest Paid</span>
                      <span className="text-rose-600">{formatCurrency(fy.totalInterestPaid)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl shadow-[2px_2px_0px_0px_var(--border-color)]">
                      <span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Scheduled Principal</span>
                      <span className="text-blue-600">{formatCurrency(fy.totalScheduledPrincipalPaid)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl shadow-[2px_2px_0px_0px_var(--border-color)]">
                      <span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Lump Sum Prepayments</span>
                      <span className="text-emerald-600">{formatCurrency(fy.totalLumpsumPrepayment)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl shadow-[2px_2px_0px_0px_var(--border-color)]">
                      <span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Excess EMI Prepayments</span>
                      <span className="text-cyan-600">{formatCurrency(fy.totalExcessMonthlyPrepayment)}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t-2 border-dashed border-[var(--border-color)] flex items-center justify-between font-black text-sm">
                    <span className="text-slate-800 dark:text-slate-200">Total Outflow in {fy.fyLabel}:</span>
                    <span className="text-emerald-600 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-500 rounded-lg">{formatCurrency(fy.totalPaymentMade)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
