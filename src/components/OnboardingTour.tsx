'use client';

import { ArrowRight, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const tourSteps = [
  {
    target: '#summary-cards',
    title: '1. Summary Metrics',
    description: 'The top cards display your real-world outstanding balance as of today, total interest saved, and projected payoff target date.',
  },
  {
    target: '#loan-form',
    title: '2. Loan Parameters',
    description: 'Input your principal, interest rate, and tenure to set your baseline.',
  },
  {
    target: '#rate-revisions',
    title: '3. Rate Revisions',
    description: 'Log floating rate changes over time to keep your schedule accurate.',
  },
  {
    target: '#prepayment-manager',
    title: '4. Prepayment Manager',
    description: 'Add lumpsum or extra monthly payments to see how much interest and time you save.',
  },
  {
    target: '#nav-menu',
    title: '5. Navigation Pages',
    description: 'Use the top menu bar to explore dedicated pages for Financial Year Breakdowns, Decision Simulator, Tax Strategizer, and Schedule.',
  },
];

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('has_seen_onboarding_tour');
    if (!hasSeenTour) {
      // Delay starting tour to let DOM render
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const updateRect = () => {
    const currentTarget = tourSteps[step]?.target;
    if (!currentTarget) return;
    const el = document.querySelector(currentTarget);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure DOM is rendered before calculating
    const timer = setTimeout(() => {
      const currentTarget = tourSteps[step]?.target;
      if (!currentTarget) return;
      const el = document.querySelector(currentTarget);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        // Scroll into view gently
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Listen to scroll and resize to update rect
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [step, isOpen]);

  const handleComplete = () => {
    localStorage.setItem('has_seen_onboarding_tour', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const currentStep = tourSteps[step];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Spotlight Hole using box-shadow for dimming background */}
      {targetRect && (
        <div 
          className="absolute border-2 border-white bg-transparent rounded-2xl transition-all duration-300 ease-in-out pointer-events-auto"
          style={{
            top: targetRect.top - 12,
            left: targetRect.left - 12,
            width: targetRect.width + 24,
            height: targetRect.height + 24,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
          }}
        />
      )}

      {/* Floating Pointer Card */}
      {targetRect && (
        <div 
          className="absolute bento-card p-5 max-w-sm w-full bg-white dark:bg-slate-900 pointer-events-auto transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(226,232,240,1)]"
          style={{
            // Position below target, or above if near bottom of screen
            top: targetRect.bottom + 32 > window.innerHeight - 250 ? targetRect.top - 280 : targetRect.bottom + 32,
            // Keep within horizontal bounds
            left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 384 - 16)),
          }}
        >
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 p-1 text-slate-500 hover:text-black dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF08A] text-black border-2 border-[var(--border-color)] shadow-[2px_2px_0px_0px_var(--border-color)]">
              Step {step + 1} of {tourSteps.length}
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {currentStep.title}
          </h3>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {currentStep.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t-2 border-[var(--border-color)] border-dashed">
            <button
              onClick={handleComplete}
              className="text-sm font-bold text-slate-500 hover:text-black dark:hover:text-white transition"
            >
              Skip Tour
            </button>

            <div className="flex gap-2">
              {step < tourSteps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2.5 bg-[#A7F3D0] text-black text-sm bento-button hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="px-4 py-2.5 bg-[#A7F3D0] text-black text-sm bento-button hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Done</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
