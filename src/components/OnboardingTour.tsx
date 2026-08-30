'use client';

import { ArrowRight, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('has_seen_onboarding_tour');
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('has_seen_onboarding_tour', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to Home Loan Tracker!',
      description: 'Your intelligent dashboard to forecast variable interest rates, optimize prepayments, and simulate wealth strategies.',
    },
    {
      title: '1. Summary Metrics',
      description: 'The top cards display your real-world outstanding balance as of today, total interest saved, and projected payoff target date.',
    },
    {
      title: '2. Loan Parameters & Revisions',
      description: 'Input your principal, interest rate, and tenure. You can log floating rate changes and prepayments anytime.',
    },
    {
      title: '3. Navigation Pages',
      description: 'Use the top menu bar to explore dedicated pages for Financial Year Breakdowns, Decision Simulator, Tax Strategizer, and Schedule.',
    },
    {
      title: '4. 1-Click Share & Export',
      description: 'Click "1-Click Share" to generate a read-only link for your spouse or financial advisor, or print bank-ready PDF statements.',
    },
  ];

  const currentStep = tourSteps[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bento-card p-6 max-w-md w-full relative shadow-2xl">
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            Step {step} of {tourSteps.length}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {currentStep.title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          {currentStep.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleComplete}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
          >
            Skip Tour
          </button>

          <div className="flex gap-2">
            {step < tourSteps.length ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
