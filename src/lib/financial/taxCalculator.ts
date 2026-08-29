import { FinancialYearRow } from './fyAggregator';

export interface TaxDeductionSummary {
  fyLabel: string;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  sec24bEligibleInterest: number; // Max 2,00,000 for self-occupied
  sec80cEligiblePrincipal: number; // Max 1,50,000
  totalOldRegimeDeduction: number; // sec24b + sec80c
  estimatedTaxSaved30Percent: number; // 30% slab savings under Old Regime
  estimatedTaxSaved20Percent: number; // 20% slab savings under Old Regime
}

export function calculateTaxDeductions(fyRows: FinancialYearRow[]): TaxDeductionSummary[] {
  return fyRows.map((fy) => {
    const sec24bEligibleInterest = Math.min(fy.totalInterestPaid, 200000);
    const sec80cEligiblePrincipal = Math.min(fy.totalPrincipalPaid, 150000);
    const totalOldRegimeDeduction = sec24bEligibleInterest + sec80cEligiblePrincipal;

    return {
      fyLabel: fy.fyLabel,
      totalInterestPaid: fy.totalInterestPaid,
      totalPrincipalPaid: fy.totalPrincipalPaid,
      sec24bEligibleInterest,
      sec80cEligiblePrincipal,
      totalOldRegimeDeduction,
      estimatedTaxSaved30Percent: Math.round(totalOldRegimeDeduction * 0.312), // 30% tax + 4% cess
      estimatedTaxSaved20Percent: Math.round(totalOldRegimeDeduction * 0.208), // 20% tax + 4% cess
    };
  });
}
