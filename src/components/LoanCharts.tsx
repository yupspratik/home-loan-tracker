'use client';

import { MonthlyScheduleRow } from '@/lib/financial/types';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface LoanChartsProps {
  rows: MonthlyScheduleRow[];
}

export function LoanCharts({ rows }: LoanChartsProps) {
  // Sample data to keep chart smooth (e.g. 1 data point per year or every 6 months if large)
  const chartData = useMemo(() => {
    const step = rows.length > 60 ? Math.ceil(rows.length / 40) : 1;
    const sampled: any[] = [];

    for (let i = 0; i < rows.length; i += step) {
      const row = rows[i];
      sampled.push({
        label: row.monthLabel,
        monthIndex: row.monthIndex,
        balance: Math.round(row.closingBalance),
        interestPaid: Math.round(row.interestPaid),
        principalPaid: Math.round(row.totalPrincipalPaid),
      });
    }

    // Always include last payoff row
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      if (sampled[sampled.length - 1]?.monthIndex !== lastRow.monthIndex) {
        sampled.push({
          label: lastRow.monthLabel,
          monthIndex: lastRow.monthIndex,
          balance: Math.round(lastRow.closingBalance),
          interestPaid: Math.round(lastRow.interestPaid),
          principalPaid: Math.round(lastRow.totalPrincipalPaid),
        });
      }
    }

    return sampled;
  }, [rows]);

  const formatLakhs = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Loan Balance Trajectory */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <LineChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Outstanding Balance Curve</h3>
            <p className="text-xs text-slate-400">Forecast of remaining principal balance over time</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={formatLakhs} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val: any) => [new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val)), 'Balance Left']}
              />
              <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#balanceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Principal vs Interest Component */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Principal vs Interest Component</h3>
            <p className="text-xs text-slate-400">Monthly payment distribution progression</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={formatLakhs} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val: any, name: any) => [
                  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val)),
                  name === 'principalPaid' ? 'Principal Paid' : 'Interest Paid',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="principalPaid" name="Principal Paid" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#principalGrad)" />
              <Area type="monotone" dataKey="interestPaid" name="Interest Paid" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#interestGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
