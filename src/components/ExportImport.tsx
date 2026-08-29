'use client';

import { MonthlyScheduleRow } from '@/lib/financial/types';
import { SavedLoanState } from '@/lib/storage';
import { Download, FileSpreadsheet, FileText, Upload } from 'lucide-react';
import React, { useRef } from 'react';

interface ExportImportProps {
  rows: MonthlyScheduleRow[];
  loanState: SavedLoanState;
  onImport: (state: SavedLoanState) => void;
}

export function ExportImport({ rows, loanState, onImport }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export Amortization Schedule to CSV
  const exportToCSV = () => {
    if (!rows || rows.length === 0) return;

    const headers = [
      'Month Index',
      'Month/Year',
      'Opening Balance',
      'Interest Rate (%)',
      'Scheduled EMI',
      'Actual Paid EMI',
      'Interest Paid',
      'Scheduled Principal',
      'Total Prepayment',
      'Total Principal Paid',
      'Closing Balance',
    ];

    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const line = [
        r.monthIndex,
        `"${r.monthLabel}"`,
        r.openingBalance,
        r.interestRate,
        r.scheduledEmi,
        r.actualEmiPaid,
        r.interestPaid,
        r.scheduledPrincipalPaid,
        r.totalPrepayment,
        r.totalPrincipalPaid,
        r.closingBalance,
      ];
      csvLines.push(line.join(','));
    }

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Home_Loan_Amortization_Schedule_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Config to JSON
  const exportToJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(loanState, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.setAttribute('download', `Home_Loan_Tracker_Backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import Config from JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.inputs && parsed.inputs.loanAmount) {
          onImport(parsed);
          alert('Loan configuration imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl mb-12">
      <div>
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-400" />
          Data Export & Backup Tools
        </h3>
        <p className="text-xs text-slate-400">Export schedule to Excel CSV or back up your loan settings.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* CSV Export */}
        <button
          id="btn-export-csv"
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Export Schedule (CSV)
        </button>

        {/* JSON Backup */}
        <button
          id="btn-export-json"
          onClick={exportToJSON}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          Download Backup (JSON)
        </button>

        {/* JSON Restore */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          id="btn-import-json"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <Upload className="w-4 h-4" />
          Restore Backup
        </button>
      </div>
    </div>
  );
}
