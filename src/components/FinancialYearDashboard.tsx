'use client';

import { aggregateByFinancialYear, FinancialYearRow } from '@/lib/financial/fyAggregator';
import { MonthlyScheduleRow } from '@/lib/financial/types';
import { Calendar, ChevronDown, ChevronUp, DollarSign, Layers, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
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
    <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl relative backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Financial Year Dashboard (Apr – Mar)
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {fyRows.length} FY Periods
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Annual breakdown of interest, principal, lump sum prepayments, and excess monthly EMI payments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFyFilter}
            onChange={(e) => setSelectedFyFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none"
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
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center justify-center"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-6 space-y-6">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Lumpsum Prepayments */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Lump Sum Prepayments</span>
                <PiggyBank className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-emerald-400">
                {formatCurrency(totals.lumpsum)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">One-time & periodic scheduled prepayments</div>
            </div>

            {/* 2. Excess Monthly Prepayments */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Excess EMI Prepayments</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-bold text-cyan-400">
                {formatCurrency(totals.excessMonthly)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Paid EMI exceeding scheduled monthly EMI</div>
            </div>

            {/* 3. Total Interest Paid */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Total FY Interest Paid</span>
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl font-bold text-rose-400">
                {formatCurrency(totals.interest)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Cumulative interest across financial years</div>
            </div>

            {/* 4. Total Principal Paid */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Total FY Principal Paid</span>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-blue-400">
                {formatCurrency(totals.principal)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Scheduled principal + total prepayments</div>
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              Year-on-Year Repayment & Prepayment Distribution
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="fyLabel" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
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

          {/* FY Detailed Cards / Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Financial Year Statement Breakdown ({filteredFyRows.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFyRows.map((fy) => (
                <div
                  key={fy.fyLabel}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{fy.fyLabel}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {fy.startMonthLabel} – {fy.endMonthLabel} ({fy.monthsCount}m)
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 font-mono">
                      End Balance: {formatCurrency(fy.closingBalance)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-900/60 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">Interest Paid</span>
                      <span className="font-semibold text-rose-400">{formatCurrency(fy.totalInterestPaid)}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">Scheduled Principal</span>
                      <span className="font-semibold text-slate-200">{formatCurrency(fy.totalScheduledPrincipalPaid)}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">Lump Sum Prepayments</span>
                      <span className="font-semibold text-emerald-400">{formatCurrency(fy.totalLumpsumPrepayment)}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded-xl">
                      <span className="text-slate-500 block text-[11px]">Excess EMI Prepayments</span>
                      <span className="font-semibold text-cyan-400">{formatCurrency(fy.totalExcessMonthlyPrepayment)}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-400">Total Outflow in {fy.fyLabel}:</span>
                    <span className="text-emerald-400 font-bold font-mono">{formatCurrency(fy.totalPaymentMade)}</span>
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
