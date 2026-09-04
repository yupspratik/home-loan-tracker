import {
  ActualPaymentLog,
  InterestRateChange,
  LoanInputs,
  PrepaymentRule,
} from './financial/types';

export interface SavedLoanState {
  inputs: LoanInputs;
  rateChanges: InterestRateChange[];
  prepaymentRules: PrepaymentRule[];
  actualPaymentLogs: ActualPaymentLog[];
  ownerId?: string | null;
}

export const DEFAULT_LOAN_STATE: SavedLoanState = {
  inputs: {
    loanAmount: 5000000,
    annualInterestRate: 8.5,
    tenureMonths: 240, // 20 years
    startYear: 2024,
    startMonth: 1,
    recalculationStrategy: 'REDUCE_TENURE',
  },
  rateChanges: [
    { monthIndex: 13, newAnnualRate: 8.75 }, // Example rate change at month 13
  ],
  prepaymentRules: [
    {
      id: 'prepay-1',
      type: 'YEARLY',
      amount: 100000,
      startMonthIndex: 12,
    },
  ],
  actualPaymentLogs: [],
};

const STORAGE_KEY = 'home_loan_tracker_state_v1';

export function loadLoanStateFromStorage(): SavedLoanState {
  if (typeof window === 'undefined') return DEFAULT_LOAN_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LOAN_STATE;
    const parsed = JSON.parse(raw);
    return {
      inputs: { ...DEFAULT_LOAN_STATE.inputs, ...(parsed.inputs || {}) },
      rateChanges: parsed.rateChanges || [],
      prepaymentRules: parsed.prepaymentRules || [],
      actualPaymentLogs: parsed.actualPaymentLogs || [],
      ownerId: parsed.ownerId || null,
    };
  } catch (e) {
    console.error('Failed to load loan state from local storage:', e);
    return DEFAULT_LOAN_STATE;
  }
}

export function saveLoanStateToStorage(state: SavedLoanState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save loan state to local storage:', e);
  }
}
