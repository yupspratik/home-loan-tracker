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
    <section className="bento-card p-6 mb-8 bg-gradient-to-br from-violet-500/5 to-rose-500/5 border-violet-200/50 dark:border-violet-800/40">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Financial Year Statement (Apr – Mar)
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
              {fyRows.length} FY Periods
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Annual summary of interest, principal, lump sum prepayments, and excess monthly EMI payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFyFilter}
            onChange={(e) => setSelectedFyFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
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
            className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-6 space-y-6">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Lumpsum */}
            <div className="bento-card p-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Lump Sum Prepayments
              </span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totals.lumpsum)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">One-time & periodic prepayments</div>
            </div>

            {/* Excess Monthly */}
            <div className="bento-card p-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Excess EMI Prepayments
              </span>
              <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400">
                {formatCurrency(totals.excessMonthly)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Paid EMI exceeding scheduled EMI</div>
            </div>

            {/* Interest Paid */}
            <div className="bento-card p-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Total FY Interest Paid
              </span>
              <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                {formatCurrency(totals.interest)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cumulative interest paid</div>
            </div>

            {/* Principal Paid */}
            <div className="bento-card p-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Total FY Principal Paid
              </span>
              <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                {formatCurrency(totals.principal)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Scheduled principal + prepayments</div>
            </div>
          </div>

          {/* Visual Stacked Bar Chart */}
          <div className="bento-card p-5">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
              Year-on-Year Repayment & Prepayment Distribution
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
                  <XAxis dataKey="fyLabel" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#ffffff',
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Principal Paid" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="Interest Paid" fill="#f43f5e" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="Lumpsum Prepayments" fill="#10b981" radius={[4, 4, 0, 0]} stackId="b" />
                  <Bar dataKey="Excess EMI Prepayments" fill="#06b6d4" radius={[4, 4, 0, 0]} stackId="b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed FY Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Financial Year Statement Breakdown ({filteredFyRows.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFyRows.map((fy) => (
                <div key={fy.fyLabel} className="bento-card p-5">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-base">{fy.fyLabel}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {fy.startMonthLabel} – {fy.endMonthLabel} ({fy.monthsCount}m)
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      End: {formatCurrency(fy.closingBalance)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">Interest Paid</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(fy.totalInterestPaid)}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">Scheduled Principal</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(fy.totalScheduledPrincipalPaid)}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">Lump Sum Prepayments</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(fy.totalLumpsumPrepayment)}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">Excess EMI Prepayments</span>
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">{formatCurrency(fy.totalExcessMonthlyPrepayment)}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500">Total Outflow in {fy.fyLabel}:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{formatCurrency(fy.totalPaymentMade)}</span>
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
