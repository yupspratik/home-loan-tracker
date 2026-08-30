'use client';

import {
  ActualPaymentLog,
  InterestRateChange,
  LoanInputs,
  PrepaymentRule,
} from '@/lib/financial/types';
import {
  DEFAULT_LOAN_STATE,
  loadLoanStateFromStorage,
  SavedLoanState,
  saveLoanStateToStorage,
} from '@/lib/storage';
import { calculateAmortization } from '@/lib/financial/calculator';
import { supabase } from '@/lib/supabaseClient';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

interface LoanContextType {
  isLoaded: boolean;
  user: any;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  loanInputs: LoanInputs;
  setLoanInputs: (inputs: LoanInputs) => void;
  rateChanges: InterestRateChange[];
  setRateChanges: (changes: InterestRateChange[]) => void;
  prepaymentRules: PrepaymentRule[];
  setPrepaymentRules: (rules: PrepaymentRule[]) => void;
  actualPaymentLogs: ActualPaymentLog[];
  setActualPaymentLogs: (logs: ActualPaymentLog[]) => void;
  loanSummary: any; // Using any for brevity here, or import LoanSummary
  scheduleRows: any[];
  currentMonthIndex: number;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

// A realistic seeded data state for the demo mode
const SEEDED_DEMO_STATE: SavedLoanState = {
  inputs: {
    loanAmount: 5000000,
    annualInterestRate: 8.5,
    tenureMonths: 240,
    startMonth: 1,
    startYear: 2024,
    recalculationStrategy: 'REDUCE_TENURE',
  },
  rateChanges: [{ monthIndex: 12, newAnnualRate: 9.25 }],
  prepaymentRules: [
    { id: 'prepay-1', type: 'MONTHLY', amount: 10000, startMonthIndex: 6 },
    { id: 'prepay-2', type: 'ONE_TIME', amount: 500000, startMonthIndex: 24 }
  ],
  actualPaymentLogs: [],
};

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isDbSynced, setIsDbSynced] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const [loanInputs, setLoanInputs] = useState<LoanInputs>(DEFAULT_LOAN_STATE.inputs);
  const [rateChanges, setRateChanges] = useState<InterestRateChange[]>(DEFAULT_LOAN_STATE.rateChanges);
  const [prepaymentRules, setPrepaymentRules] = useState<PrepaymentRule[]>(DEFAULT_LOAN_STATE.prepaymentRules);
  const [actualPaymentLogs, setActualPaymentLogs] = useState<ActualPaymentLog[]>(DEFAULT_LOAN_STATE.actualPaymentLogs);

  // Load state or apply demo data
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    if (isDemoMode) {
      // Seed data if demo mode activated
      setLoanInputs(SEEDED_DEMO_STATE.inputs);
      setRateChanges(SEEDED_DEMO_STATE.rateChanges!);
      setPrepaymentRules(SEEDED_DEMO_STATE.prepaymentRules!);
      setActualPaymentLogs(SEEDED_DEMO_STATE.actualPaymentLogs!);
      setIsLoaded(true);
    } else {
      const saved = loadLoanStateFromStorage();
      setLoanInputs(saved.inputs);
      setRateChanges(saved.rateChanges || []);
      setPrepaymentRules(saved.prepaymentRules || []);
      setActualPaymentLogs(saved.actualPaymentLogs || []);
      setIsLoaded(true);

      // Sync with Supabase API backend if configured
      fetch('/api/loans')
        .then((res) => res.json())
        .then((data) => {
          if (data.isDbConfigured) {
            setIsDbSynced(true);
            if (data.loanState) {
              setLoanInputs(data.loanState.inputs);
              setRateChanges(data.loanState.rateChanges || []);
              setPrepaymentRules(data.loanState.prepaymentRules || []);
              setActualPaymentLogs(data.loanState.actualPaymentLogs || []);
            }
          }
        })
        .catch((err) => console.log('Browser storage mode active'));
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isDemoMode]);

  // Auto-save changes to local storage & Supabase API if NOT in demo mode
  useEffect(() => {
    if (!isLoaded || isDemoMode) return;

    const stateToSave: SavedLoanState = {
      inputs: loanInputs,
      rateChanges,
      prepaymentRules,
      actualPaymentLogs,
    };

    saveLoanStateToStorage(stateToSave);

    if (isDbSynced) {
      fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateToSave),
      }).catch((err) => console.error('Cloud sync error:', err));
    }
  }, [loanInputs, rateChanges, prepaymentRules, actualPaymentLogs, isLoaded, isDemoMode, isDbSynced]);

  const { summary: loanSummary, rows: scheduleRows } = useMemo(() => {
    return calculateAmortization(loanInputs, rateChanges, prepaymentRules, actualPaymentLogs);
  }, [loanInputs, rateChanges, prepaymentRules, actualPaymentLogs]);

  // Compute current elapsed month index based on real world date vs loan start date
  const currentMonthIndex = useMemo(() => {
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth() + 1;
    return (todayYear - (loanInputs.startYear || todayYear)) * 12 + (todayMonth - (loanInputs.startMonth || 1)) + 1;
  }, [loanInputs.startYear, loanInputs.startMonth]);

  return (
    <LoanContext.Provider
      value={{
        isLoaded,
        user,
        isDemoMode,
        setIsDemoMode,
        loanInputs,
        setLoanInputs,
        rateChanges,
        setRateChanges,
        prepaymentRules,
        setPrepaymentRules,
        actualPaymentLogs,
        setActualPaymentLogs,
        loanSummary,
        scheduleRows,
        currentMonthIndex,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
}

export function useLoan() {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
}
