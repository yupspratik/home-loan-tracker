'use client';

import { ChevronDown, FolderPlus, Layers } from 'lucide-react';
import { useState } from 'react';

interface PortfolioSelectorProps {
  currentLoanName?: string;
  onSelectPortfolio?: (name: string) => void;
}

export function PortfolioSelector({
  currentLoanName = 'Primary Home Loan',
  onSelectPortfolio,
}: PortfolioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [portfolios, setPortfolios] = useState<string[]>([
    'Primary Home Loan',
    'Rental Property Loan',
    'Car Loan',
  ]);
  const [activePortfolio, setActivePortfolio] = useState<string>(currentLoanName);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');

  const handleSelect = (name: string) => {
    setActivePortfolio(name);
    setIsOpen(false);
    if (onSelectPortfolio) onSelectPortfolio(name);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioName.trim()) return;
    const name = newPortfolioName.trim();
    if (!portfolios.includes(name)) {
      setPortfolios([...portfolios, name]);
    }
    setActivePortfolio(name);
    setNewPortfolioName('');
    setIsAddingNew(false);
    setIsOpen(false);
    if (onSelectPortfolio) onSelectPortfolio(name);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition"
      >
        <Layers className="w-3.5 h-3.5 text-indigo-400" />
        <span className="truncate max-w-[110px]">{activePortfolio}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
            My Loan Portfolios
          </div>

          <div className="space-y-0.5 max-h-48 overflow-y-auto">
            {portfolios.map((name) => (
              <button
                key={name}
                onClick={() => handleSelect(name)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                  activePortfolio === name
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{name}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 mt-2 border-t border-slate-800">
            {isAddingNew ? (
              <form onSubmit={handleCreate} className="p-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Plot Loan"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white mb-2 focus:outline-none"
                />
                <div className="flex gap-1">
                  <button
                    type="submit"
                    className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-2 py-1 bg-slate-800 text-slate-400 text-[11px] rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingNew(true)}
                className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-indigo-400 hover:bg-slate-800 flex items-center gap-1.5 font-medium"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ New Loan Portfolio</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
