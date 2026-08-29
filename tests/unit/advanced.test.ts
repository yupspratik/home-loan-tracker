import { describe, expect, it } from 'vitest';
import { calculateAmortization } from '../../src/lib/financial/calculator';
import { aggregateByFinancialYear, getFinancialYearLabel } from '../../src/lib/financial/fyAggregator';
import { simulateBalanceTransfer, simulatePrepayVsInvest } from '../../src/lib/financial/simulator';
import { calculateTaxDeductions } from '../../src/lib/financial/taxCalculator';

describe('Advanced Financial Engines (FY, Tax & What-If)', () => {
  it('correctly maps calendar month and year to Indian Financial Year (Apr-Mar)', () => {
    expect(getFinancialYearLabel(4, 2024).fyLabel).toBe('FY 2024-25');
    expect(getFinancialYearLabel(12, 2024).fyLabel).toBe('FY 2024-25');
    expect(getFinancialYearLabel(1, 2025).fyLabel).toBe('FY 2024-25');
    expect(getFinancialYearLabel(3, 2025).fyLabel).toBe('FY 2024-25');
    expect(getFinancialYearLabel(4, 2025).fyLabel).toBe('FY 2025-26');
  });

  it('aggregates monthly amortization rows into Financial Year totals', () => {
    const calc = calculateAmortization({
      loanAmount: 5000000,
      annualInterestRate: 8.5,
      tenureMonths: 240,
      startYear: 2024,
      startMonth: 4, // Starts in April 2024
    });

    const fyRows = aggregateByFinancialYear(calc.rows);

    expect(fyRows.length).toBeGreaterThan(0);
    expect(fyRows[0].fyLabel).toBe('FY 2024-25');
    expect(fyRows[0].monthsCount).toBe(12);
    expect(fyRows[0].totalInterestPaid).toBeGreaterThan(0);
    expect(fyRows[0].totalPrincipalPaid).toBeGreaterThan(0);
  });

  it('calculates Section 24b and Section 80C tax deduction limits accurately', () => {
    const calc = calculateAmortization({
      loanAmount: 5000000,
      annualInterestRate: 8.5,
      tenureMonths: 240,
      startYear: 2024,
      startMonth: 4,
    });

    const fyRows = aggregateByFinancialYear(calc.rows);
    const taxSummaries = calculateTaxDeductions(fyRows);

    expect(taxSummaries[0].sec24bEligibleInterest).toBeLessThanOrEqual(200000);
    expect(taxSummaries[0].sec80cEligiblePrincipal).toBeLessThanOrEqual(150000);
    expect(taxSummaries[0].estimatedTaxSaved30Percent).toBeGreaterThan(0);
  });

  it('simulates Prepay vs Invest scenarios accurately', () => {
    const result = simulatePrepayVsInvest({
      prepaymentAmount: 500000,
      isMonthlySip: false,
      loanInterestRate: 8.5,
      expectedInvestmentRoi: 12.0,
      horizonYears: 10,
    });

    expect(result.recommendation).toBe('INVEST');
    expect(result.investmentFutureValue).toBeGreaterThan(result.guaranteedInterestSavedFromPrepayment);
  });

  it('simulates Balance Transfer savings and payback period accurately', () => {
    const result = simulateBalanceTransfer({
      currentBalance: 4000000,
      currentRate: 9.25,
      newRate: 8.4,
      remainingTenureMonths: 180,
      processingFeePercentage: 0.5,
      flatProcessingFee: 2000,
    });

    expect(result.isViable).toBe(true);
    expect(result.monthlyEmiSavings).toBeGreaterThan(0);
    expect(result.netLifetimeSavings).toBeGreaterThan(0);
  });
});
