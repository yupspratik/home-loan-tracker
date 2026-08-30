'use client';

import { ActualPaymentLog, InterestRateChange, MonthlyScheduleRow } from '@/lib/financial/types';
import { ChevronLeft, ChevronRight, Edit2, Search } from 'lucide-react';
import { PdfExportButton } from './PdfExportButton';
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
    <div className="bento-card p-6 mb-8" id="amortization-table">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b-2 border-dashed border-[var(--border-color)]">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Amortization & Forecast Schedule</h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
            Month-by-month breakdown of principal, interest, prepayments, and closing balance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search month or year..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none shadow-[2px_2px_0px_0px_var(--border-color)] w-48 sm:w-64 transition-all"
            />
          </div>
          <PdfExportButton />
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-[var(--border-color)] shadow-[4px_4px_0px_0px_var(--border-color)]">
        <table className="w-full text-sm text-left text-slate-900 dark:text-white">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b-2 border-[var(--border-color)] font-black uppercase text-xs">
            <tr>
              <th className="p-4 border-r-2 border-dashed border-[var(--border-color)]">Month</th>
              <th className="p-4 text-right border-r-2 border-dashed border-[var(--border-color)]">Opening Balance</th>
              <th className="p-4 text-center border-r-2 border-dashed border-[var(--border-color)]">Interest Rate</th>
              <th className="p-4 text-right border-r-2 border-dashed border-[var(--border-color)]">Scheduled EMI</th>
              <th className="p-4 text-right border-r-2 border-dashed border-[var(--border-color)] bg-blue-50 dark:bg-blue-900/30">Actual Paid EMI</th>
              <th className="p-4 text-right border-r-2 border-dashed border-[var(--border-color)]">Interest Paid</th>
              <th className="p-4 text-right border-r-2 border-dashed border-[var(--border-color)]">Principal Paid</th>
              <th className="p-4 text-right border-r-2 border-dashed border-[var(--border-color)]">Prepayment</th>
              <th className="p-4 text-right">Closing Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[var(--border-color)] font-mono font-bold">
            {currentPageRows.map((row) => {
              const isEditingLog = editingLogMonth === row.monthIndex;
              const isEditingRate = editingRateMonth === row.monthIndex;

              return (
                <tr
                  key={row.monthIndex}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    row.isPayoffMonth ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''
                  }`}
                >
                  <td className="p-4 font-sans font-black text-slate-900 dark:text-white whitespace-nowrap border-r-2 border-dashed border-[var(--border-color)] bg-yellow-50 dark:bg-yellow-900/30">
                    {row.monthLabel}
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block font-mono mt-0.5">
                      m{row.monthIndex}
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap border-r-2 border-dashed border-[var(--border-color)]">
                    {formatCurrency(row.openingBalance)}
                  </td>

                  {/* Interest Rate Cell */}
                  <td className="p-4 text-center whitespace-nowrap border-r-2 border-dashed border-[var(--border-color)]">
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
                        className="w-20 px-2 py-1 bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-lg text-center text-sm font-black focus:outline-none shadow-[2px_2px_0px_0px_rgba(59,130,246,0.5)]"
                      />
                    ) : (
                      <span
                        onClick={() => {
                          if (onUpdateRateChange) {
                            setEditingRateMonth(row.monthIndex);
                            setEditingRateValue(row.interestRate.toString());
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition border-2 ${
                          rateChanges.some((rc) => rc.monthIndex === row.monthIndex)
                            ? 'bg-[#FEF08A] text-black border-transparent shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-blue-500 hover:shadow-[2px_2px_0px_0px_rgba(59,130,246,0.5)]'
                        }`}
                        title="Click to edit interest rate for this month"
                      >
                        {row.interestRate}%
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap border-r-2 border-dashed border-[var(--border-color)]">
                    {formatCurrency(row.scheduledEmi)}
                  </td>

                  {/* Actual Paid EMI Cell */}
                  <td className="p-4 text-right whitespace-nowrap border-r-2 border-dashed border-[var(--border-color)] bg-blue-50/50 dark:bg-blue-900/30 group">
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
                        className="w-28 px-2 py-1 bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-lg text-right text-sm font-black focus:outline-none shadow-[2px_2px_0px_0px_rgba(59,130,246,0.5)]"
                      />
                    ) : (
                      <div
                        onClick={() => {
                          if (onUpdateActualPaymentLog) {
                            setEditingLogMonth(row.monthIndex);
                            setEditingLogValue(row.actualEmiPaid.toString());
                          }
                        }}
                        className={`cursor-pointer flex items-center justify-end gap-1.5 font-black ${
                          row.excessEmiPrepayment > 0
                            ? 'text-cyan-600 dark:text-cyan-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                        title="Click to log actual EMI payment made"
                      >
                        {onUpdateActualPaymentLog && <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />}
                        <span>{formatCurrency(row.actualEmiPaid)}</span>
                      </div>
                    )}
                  </td>

                  <td className="p-4 text-right text-rose-600 dark:text-rose-400 whitespace-nowrap border-r-2 border-dashed border-[var(--border-color)]">
                    {formatCurrency(row.interestPaid)}
                  </td>
                  <td className="p-4 text-right text-slate-900 dark:text-white whitespace-nowrap border-r-2 border-dashed border-[var(--border-color)]">
                    {formatCurrency(row.totalPrincipalPaid)}
                  </td>
                  <td className="p-4 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap border-r-2 border-dashed border-[var(--border-color)]">
                    {row.totalPrepayment > 0 ? formatCurrency(row.totalPrepayment) : '-'}
                  </td>
                  <td className="p-4 text-right font-black text-slate-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(row.closingBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t-2 border-dashed border-[var(--border-color)] text-sm font-bold text-slate-700 dark:text-slate-300">
        <div>
          Page {page} of {totalPages} <span className="opacity-60 ml-1">({filteredRows.length} months)</span>
        </div>
        <div className="flex gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2.5 bg-white dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-slate-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-[2px_2px_0px_0px_var(--border-color)] active:translate-y-[2px] active:shadow-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2.5 bg-white dark:bg-slate-800 border-2 border-[var(--border-color)] rounded-xl text-slate-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-[2px_2px_0px_0px_var(--border-color)] active:translate-y-[2px] active:shadow-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
