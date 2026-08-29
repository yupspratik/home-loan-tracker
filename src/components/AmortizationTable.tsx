'use client';

import { ActualPaymentLog, InterestRateChange, MonthlyScheduleRow } from '@/lib/financial/types';
import { ArrowDownAZ, CheckCircle2, ChevronLeft, ChevronRight, Edit2, Search, Zap } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface AmortizationTableProps {
  rows: MonthlyScheduleRow[];
  rateChanges: InterestRateChange[];
  actualLogs: ActualPaymentLog[];
  onUpdateRateChange: (rateChanges: InterestRateChange[]) => void;
  onUpdateActualPaymentLog: (logs: ActualPaymentLog[]) => void;
}

export function AmortizationTable({
  rows,
  rateChanges,
  actualLogs,
  onUpdateRateChange,
  onUpdateActualPaymentLog,
}: AmortizationTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [editingLogMonth, setEditingLogMonth] = useState<number | null>(null);
  const [editingLogValue, setEditingLogValue] = useState<string>('');

  const [editingRateMonth, setEditingRateMonth] = useState<number | null>(null);
  const [editingRateValue, setEditingRateValue] = useState<string>('');

  const pageSize = 12; // 1 year per page for clean browsing

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.monthLabel.toLowerCase().includes(term) ||
        r.monthIndex.toString().includes(term) ||
        r.year.toString().includes(term)
    );
  }, [rows, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const currentPageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  // Handle inline Paid EMI save
  const handleSavePaidEmi = (monthIndex: number) => {
    const numVal = parseFloat(editingLogValue);
    if (isNaN(numVal) || numVal < 0) {
      setEditingLogMonth(null);
      return;
    }

    const filtered = actualLogs.filter((l) => l.monthIndex !== monthIndex);
    const updated = [...filtered, { monthIndex, paidEmi: numVal }].sort(
      (a, b) => a.monthIndex - b.monthIndex
    );

    onUpdateActualPaymentLog(updated);
    setEditingLogMonth(null);
  };

  // Handle inline Interest Rate change save
  const handleSaveRateChange = (monthIndex: number) => {
    const numVal = parseFloat(editingRateValue);
    if (isNaN(numVal) || numVal <= 0) {
      setEditingRateMonth(null);
      return;
    }

    const filtered = rateChanges.filter((r) => r.monthIndex !== monthIndex);
    const updated = [...filtered, { monthIndex, newAnnualRate: numVal }].sort(
      (a, b) => a.monthIndex - b.monthIndex
    );

    onUpdateRateChange(updated);
    setEditingRateMonth(null);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Amortization & Forecast Schedule
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              {rows.length} Months Total
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Month-by-month split of Principal, Interest, Prepayment, and Closing Balance.
          </p>
        </div>

        {/* Search & Pagination Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-schedule"
              type="text"
              placeholder="Search year/month..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none w-44"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-2 py-1 text-xs">
            <button
              id="btn-prev-page"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-400 font-medium px-1">
              Page <strong className="text-white">{page}</strong> of {totalPages}
            </span>
            <button
              id="btn-next-page"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table id="amortization-table" className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3 text-center">Month</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3 text-right">Opening Bal</th>
              <th className="py-3 px-3 text-center">Rate (%)</th>
              <th className="py-3 px-3 text-right">Sched. EMI</th>
              <th className="py-3 px-3 text-right">Paid EMI</th>
              <th className="py-3 px-3 text-right text-rose-400">Interest</th>
              <th className="py-3 px-3 text-right text-blue-400">Sched. Principal</th>
              <th className="py-3 px-3 text-right text-emerald-400">Prepayment</th>
              <th className="py-3 px-3 text-right text-emerald-300">Total Principal</th>
              <th className="py-3 px-3 text-right text-white">Closing Bal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {currentPageRows.map((row) => {
              const isRateEditing = editingRateMonth === row.monthIndex;
              const isLogEditing = editingLogMonth === row.monthIndex;
              const isExcessPaid = row.excessEmiPrepayment > 0;
              const isPrepaid = row.totalPrepayment > 0;

              return (
                <tr
                  key={row.monthIndex}
                  id={`row-month-${row.monthIndex}`}
                  className={`hover:bg-slate-800/50 transition-all ${
                    row.isPayoffMonth ? 'bg-emerald-950/30 border-l-4 border-l-emerald-500' : ''
                  }`}
                >
                  {/* Month Index */}
                  <td className="py-3 px-3 text-center font-bold text-slate-400">
                    #{row.monthIndex}
                  </td>

                  {/* Date Label */}
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-200">
                    {row.monthLabel}
                    {row.isPayoffMonth && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Paid Off!
                      </span>
                    )}
                  </td>

                  {/* Opening Balance */}
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {formatCurrency(row.openingBalance)}
                  </td>

                  {/* Interest Rate (%) + Inline edit */}
                  <td className="py-3 px-3 text-center font-mono">
                    {isRateEditing ? (
                      <input
                        id={`input-inline-rate-${row.monthIndex}`}
                        type="number"
                        step="0.05"
                        autoFocus
                        value={editingRateValue}
                        onChange={(e) => setEditingRateValue(e.target.value)}
                        onBlur={() => handleSaveRateChange(row.monthIndex)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRateChange(row.monthIndex);
                        }}
                        className="w-16 bg-slate-800 border border-indigo-500 text-center rounded px-1 py-0.5 text-xs text-white outline-none"
                      />
                    ) : (
                      <button
                        title="Click to edit rate for this month"
                        onClick={() => {
                          setEditingRateMonth(row.monthIndex);
                          setEditingRateValue(row.interestRate.toString());
                        }}
                        className="inline-flex items-center gap-1 hover:text-indigo-400 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-all text-indigo-300"
                      >
                        {row.interestRate}%
                        <Edit2 className="w-3 h-3 opacity-40 hover:opacity-100" />
                      </button>
                    )}
                  </td>

                  {/* Scheduled EMI */}
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {formatCurrency(row.scheduledEmi)}
                  </td>

                  {/* Paid EMI + Inline edit */}
                  <td className="py-3 px-3 text-right font-mono">
                    {isLogEditing ? (
                      <input
                        id={`input-inline-paid-emi-${row.monthIndex}`}
                        type="number"
                        autoFocus
                        value={editingLogValue}
                        onChange={(e) => setEditingLogValue(e.target.value)}
                        onBlur={() => handleSavePaidEmi(row.monthIndex)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSavePaidEmi(row.monthIndex);
                        }}
                        className="w-24 bg-slate-800 border border-emerald-500 text-right rounded px-1.5 py-0.5 text-xs text-white outline-none"
                      />
                    ) : (
                      <button
                        title="Click to log actual EMI paid"
                        onClick={() => {
                          setEditingLogMonth(row.monthIndex);
                          setEditingLogValue(row.actualEmiPaid.toString());
                        }}
                        className={`inline-flex items-center justify-end gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-all ${
                          isExcessPaid ? 'text-emerald-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        {formatCurrency(row.actualEmiPaid)}
                        <Edit2 className="w-3 h-3 opacity-40 hover:opacity-100" />
                      </button>
                    )}
                  </td>

                  {/* Interest Paid */}
                  <td className="py-3 px-3 text-right font-mono text-rose-400 font-medium">
                    {formatCurrency(row.interestPaid)}
                  </td>

                  {/* Scheduled Principal Paid */}
                  <td className="py-3 px-3 text-right font-mono text-blue-400">
                    {formatCurrency(row.scheduledPrincipalPaid)}
                  </td>

                  {/* Prepayment Amount (Rules + Excess EMI) */}
                  <td className="py-3 px-3 text-right font-mono">
                    {isPrepaid ? (
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        +{formatCurrency(row.totalPrepayment)}
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  {/* Total Principal Paid */}
                  <td className="py-3 px-3 text-right font-mono text-emerald-300 font-semibold">
                    {formatCurrency(row.totalPrincipalPaid)}
                  </td>

                  {/* Closing Balance */}
                  <td className="py-3 px-3 text-right font-mono text-white font-bold">
                    {formatCurrency(row.closingBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
