'use client';

import { ActualPaymentLog, InterestRateChange, MonthlyScheduleRow } from '@/lib/financial/types';
import { ChevronLeft, ChevronRight, Edit2, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface AmortizationTableProps {
  rows: MonthlyScheduleRow[];
  rateChanges: InterestRateChange[];
  actualLogs: ActualPaymentLog[];
  onUpdateRateChange?: (rateChanges: InterestRateChange[]) => void;
  onUpdateActualPaymentLog?: (logs: ActualPaymentLog[]) => void;
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

    if (onUpdateActualPaymentLog) {
      onUpdateActualPaymentLog(updated);
    }
    setEditingLogMonth(null);
  };

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

    if (onUpdateRateChange) {
      onUpdateRateChange(updated);
    }
    setEditingRateMonth(null);
  };

  return (
    <div className="bento-card p-6 mb-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Amortization & Forecast Schedule</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Month-by-month breakdown of principal, interest, prepayments, and closing balance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search month or year..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none w-48"
            />
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px]">
            <tr>
              <th className="p-3">Month</th>
              <th className="p-3 text-right">Opening Balance</th>
              <th className="p-3 text-center">Interest Rate</th>
              <th className="p-3 text-right">Scheduled EMI</th>
              <th className="p-3 text-right">Actual Paid EMI</th>
              <th className="p-3 text-right">Interest Paid</th>
              <th className="p-3 text-right">Principal Paid</th>
              <th className="p-3 text-right">Prepayment</th>
              <th className="p-3 text-right">Closing Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {currentPageRows.map((row) => {
              const isEditingLog = editingLogMonth === row.monthIndex;
              const isEditingRate = editingRateMonth === row.monthIndex;

              return (
                <tr
                  key={row.monthIndex}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition ${
                    row.isPayoffMonth ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''
                  }`}
                >
                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {row.monthLabel}
                    <span className="text-[10px] font-normal text-slate-400 block font-mono">
                      m{row.monthIndex}
                    </span>
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatCurrency(row.openingBalance)}
                  </td>

                  {/* Interest Rate Cell */}
                  <td className="p-3 text-center whitespace-nowrap">
                    {isEditingRate ? (
                      <input
                        type="number"
                        step="0.05"
                        autoFocus
                        value={editingRateValue}
                        onChange={(e) => setEditingRateValue(e.target.value)}
                        onBlur={() => handleSaveRateChange(row.monthIndex)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRateChange(row.monthIndex);
                        }}
                        className="w-16 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-blue-500 rounded text-center text-xs font-bold focus:outline-none"
                      />
                    ) : (
                      <span
                        onClick={() => {
                          if (onUpdateRateChange) {
                            setEditingRateMonth(row.monthIndex);
                            setEditingRateValue(row.interestRate.toString());
                          }
                        }}
                        className={`px-2 py-0.5 rounded-full text-xs font-bold cursor-pointer transition ${
                          rateChanges.some((rc) => rc.monthIndex === row.monthIndex)
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-950'
                        }`}
                        title="Click to edit interest rate for this month"
                      >
                        {row.interestRate}%
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatCurrency(row.scheduledEmi)}
                  </td>

                  {/* Actual Paid EMI Cell */}
                  <td className="p-3 text-right whitespace-nowrap">
                    {isEditingLog ? (
                      <input
                        type="number"
                        autoFocus
                        value={editingLogValue}
                        onChange={(e) => setEditingLogValue(e.target.value)}
                        onBlur={() => handleSavePaidEmi(row.monthIndex)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSavePaidEmi(row.monthIndex);
                        }}
                        className="w-24 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-blue-500 rounded text-right text-xs font-bold focus:outline-none"
                      />
                    ) : (
                      <div
                        onClick={() => {
                          if (onUpdateActualPaymentLog) {
                            setEditingLogMonth(row.monthIndex);
                            setEditingLogValue(row.actualEmiPaid.toString());
                          }
                        }}
                        className={`cursor-pointer inline-flex items-center gap-1 font-bold ${
                          row.excessEmiPrepayment > 0
                            ? 'text-cyan-600 dark:text-cyan-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                        title="Click to log actual EMI payment made"
                      >
                        <span>{formatCurrency(row.actualEmiPaid)}</span>
                        {onUpdateActualPaymentLog && <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                      </div>
                    )}
                  </td>

                  <td className="p-3 text-right text-rose-600 dark:text-rose-400 whitespace-nowrap font-medium">
                    {formatCurrency(row.interestPaid)}
                  </td>
                  <td className="p-3 text-right text-slate-900 dark:text-white whitespace-nowrap font-medium">
                    {formatCurrency(row.totalPrincipalPaid)}
                  </td>
                  <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-medium">
                    {row.totalPrepayment > 0 ? formatCurrency(row.totalPrepayment) : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(row.closingBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div>
          Page {page} of {totalPages} ({filteredRows.length} months)
        </div>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
