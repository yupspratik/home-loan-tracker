'use client';

import { Download, FileCheck, Printer } from 'lucide-react';

export function PdfExportButton() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold shadow-sm transition"
      title="Print or Save as PDF Statement"
    >
      <Printer className="w-3.5 h-3.5 text-blue-400" />
      <span>Print / PDF Statement</span>
    </button>
  );
}
