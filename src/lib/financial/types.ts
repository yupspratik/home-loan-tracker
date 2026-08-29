export type RecalculationStrategy = 'REDUCE_TENURE' | 'REDUCE_EMI';

export type PrepaymentFrequency = 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';

export interface LoanInputs {
  loanAmount: number;
  annualInterestRate: number; // e.g. 8.5 for 8.5%
  tenureMonths: number; // e.g. 240 for 20 years
  startYear?: number; // e.g. 2024
  startMonth?: number; // 1-12 (1 = Jan)
  recalculationStrategy?: RecalculationStrategy;
}

export interface InterestRateChange {
  monthIndex: number; // 1-based index (e.g. 13 for month 13)
  newAnnualRate: number;
}

export interface PrepaymentRule {
  id: string;
  type: PrepaymentFrequency;
  amount: number;
  startMonthIndex: number; // Month index when rule begins or occurs
  endMonthIndex?: number; // Optional end limit for recurring prepayments
}

export interface ActualPaymentLog {
  monthIndex: number;
  paidEmi: number; // Actual EMI paid by borrower
}

export interface MonthlyScheduleRow {
  monthIndex: number;
  year: number;
  month: number; // 1-12
  monthLabel: string; // e.g. "Jan 2024"
  openingBalance: number;
  interestRate: number; // Effective annual rate (%)
  scheduledEmi: number; // Baseline calculated EMI
  actualEmiPaid: number; // Actual EMI logged/paid
  interestPaid: number;
  scheduledPrincipalPaid: number;
  excessEmiPrepayment: number; // max(0, actualEmiPaid - scheduledEmi)
  rulePrepayment: number; // from PrepaymentRule
  totalPrepayment: number; // excessEmiPrepayment + rulePrepayment
  totalPrincipalPaid: number; // scheduledPrincipalPaid + totalPrepayment
  closingBalance: number;
  isPayoffMonth: boolean;
}

export interface LoanSummary {
  initialLoanAmount: number;
  originalInterestRate: number;
  originalTenureMonths: number;
  actualTenureMonths: number;
  monthsSaved: number;
  originalTotalInterest: number;
  actualTotalInterest: number;
  interestSaved: number;
  totalAmountPaid: number;
  totalPrepaymentsMade: number;
  originalPayoffLabel: string;
  projectedPayoffLabel: string;
  currentBalance: number; // Balance left as of current real-world month
  currentAsOfLabel: string; // e.g. "As of Aug 2026 (Month 32)"
  currentPaidPrincipalSoFar: number;
  currentPaidInterestSoFar: number;
}

export interface AmortizationResult {
  rows: MonthlyScheduleRow[];
  summary: LoanSummary;
}
