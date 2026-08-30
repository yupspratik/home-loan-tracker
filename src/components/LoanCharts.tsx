'use client';

import { MonthlyScheduleRow } from '@/lib/financial/types';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface LoanChartsProps {
  rows: MonthlyScheduleRow[];
}

export function LoanCharts({ rows }: LoanChartsProps) {
  const chartData = useMemo(() => {
    return rows.map((r) => ({
      monthLabel: r.monthLabel,
      monthIndex: r.monthIndex,
      balance: r.closingBalance,
      principalPaid: r.totalPrincipalPaid,
      interestPaid: r.interestPaid,
      scheduledEmi: r.scheduledEmi,
      actualEmiPaid: r.actualEmiPaid,
    }));
  }, [rows]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* 1. Loan Balance Reduction Timeline */}
      <div className="bento-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Loan Balance Reduction Timeline</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Principal balance decay curve over loan tenure.</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
              <XAxis dataKey="monthLabel" stroke="#94a3b8" fontSize={10} interval={Math.floor(rows.length / 6)} />
              <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#ffffff',
                }}
                formatter={(val: any) => [formatCurrency(Number(val)), 'Remaining Balance']}
              />
              <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#balanceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Principal vs Interest Breakdown */}
      <div className="bento-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Principal vs. Interest Component</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Monthly breakdown of interest paid vs principal reduced.</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
              <XAxis dataKey="monthLabel" stroke="#94a3b8" fontSize={10} interval={Math.floor(rows.length / 6)} />
              <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#ffffff',
                }}
                formatter={(val: any, name: any) => [
                  formatCurrency(Number(val)),
                  name === 'Principal Paid' || name === 'principalPaid' ? 'Principal Paid' : 'Interest Paid',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="principalPaid" name="Principal Paid" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#principalGrad)" />
              <Area type="monotone" dataKey="interestPaid" name="Interest Paid" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#interestGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
