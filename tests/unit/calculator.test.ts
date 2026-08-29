import { describe, expect, it } from 'vitest';
import { calculateAmortization, getPrepaymentForMonth } from '../../src/lib/financial/calculator';
import { PrepaymentRule } from '../../src/lib/financial/types';

describe('Amortization Calculator Engine', () => {
  const baseInput = {
    loanAmount: 1000000,
    annualInterestRate: 10,
    tenureMonths: 120, // 10 years
    startYear: 2024,
    startMonth: 1,
  };

  it('generates a standard amortization schedule without prepayments', () => {
    const result = calculateAmortization(baseInput);

    expect(result.rows.length).toBe(120);
    expect(result.summary.monthsSaved).toBe(0);
    expect(result.summary.actualTenureMonths).toBe(120);

    // Opening balance of first month should be loan amount
    expect(result.rows[0].openingBalance).toBe(1000000);
    // Closing balance of last month should be 0
    expect(result.rows[result.rows.length - 1].closingBalance).toBe(0);
    expect(result.rows[result.rows.length - 1].isPayoffMonth).toBe(true);
  });

  it('handles interest rate change at Month 13 and persists it for subsequent months', () => {
    const rateChanges = [{ monthIndex: 13, newAnnualRate: 12 }];
    const result = calculateAmortization(baseInput, rateChanges);

    // Months 1 to 12 should have 10% rate
    expect(result.rows[0].interestRate).toBe(10);
    expect(result.rows[11].interestRate).toBe(10);

    // Month 13 onwards should have 12% rate
    expect(result.rows[12].interestRate).toBe(12);
    expect(result.rows[20].interestRate).toBe(12);

    // Check interest amount calculation in month 13
    const month13Opening = result.rows[12].openingBalance;
    const expectedInterestMonth13 = Math.round((month13Opening * 0.12 / 12) * 100) / 100;
    expect(result.rows[12].interestPaid).toBe(expectedInterestMonth13);
  });

  it('keeps scheduled EMI constant when interest rate reduces under REDUCE_TENURE mode', () => {
    // Interest rate reduces from 10% to 8% at month 13
    const rateChanges = [{ monthIndex: 13, newAnnualRate: 8 }];
    const result = calculateAmortization(
      { ...baseInput, recalculationStrategy: 'REDUCE_TENURE' },
      rateChanges
    );

    const initialEmi = result.rows[0].scheduledEmi;
    const month13Emi = result.rows[12].scheduledEmi;

    // EMI should remain constant at initial calculated EMI
    expect(month13Emi).toBe(initialEmi);

    // Rate reduction with constant EMI should reduce overall tenure
    expect(result.summary.actualTenureMonths).toBeLessThan(120);
    expect(result.summary.monthsSaved).toBeGreaterThan(0);
  });

  it('computes current date balance based on real-world elapsed months', () => {
    const result = calculateAmortization({
      loanAmount: 5000000,
      annualInterestRate: 8.5,
      tenureMonths: 240,
      startYear: 2024,
      startMonth: 1,
    });

    expect(result.summary.currentBalance).toBeGreaterThan(0);
    expect(result.summary.currentBalance).toBeLessThan(5000000);
    expect(result.summary.currentAsOfLabel).toContain('As of');
  });

  it('calculates prepayment rules across frequencies correctly', () => {
    const rules: PrepaymentRule[] = [
      { id: '1', type: 'ONE_TIME', amount: 50000, startMonthIndex: 5 },
      { id: '2', type: 'QUARTERLY', amount: 10000, startMonthIndex: 3 },
      { id: '3', type: 'YEARLY', amount: 100000, startMonthIndex: 12 },
    ];

    expect(getPrepaymentForMonth(1, rules)).toBe(0);
    expect(getPrepaymentForMonth(3, rules)).toBe(10000); // Quarterly
    expect(getPrepaymentForMonth(5, rules)).toBe(50000); // One-time
    expect(getPrepaymentForMonth(6, rules)).toBe(10000); // Quarterly (3 + 3)
    expect(getPrepaymentForMonth(12, rules)).toBe(110000); // Quarterly (10k) + Yearly (100k)
  });

  it('applies prepayments to principal and reduces total tenure (REDUCE_TENURE)', () => {
    const prepaymentRules: PrepaymentRule[] = [
      { id: '1', type: 'MONTHLY', amount: 5000, startMonthIndex: 1 },
    ];

    const result = calculateAmortization(
      { ...baseInput, recalculationStrategy: 'REDUCE_TENURE' },
      [],
      prepaymentRules
    );

    // Loan should finish earlier than 120 months
    expect(result.summary.actualTenureMonths).toBeLessThan(120);
    expect(result.summary.monthsSaved).toBeGreaterThan(0);
    expect(result.summary.interestSaved).toBeGreaterThan(0);
    expect(result.summary.totalPrepaymentsMade).toBeGreaterThan(0);
  });

  it('handles excess EMI payments where paid EMI > calculated EMI', () => {
    // Scheduled EMI for 1,000,000 at 10% for 120m is ~13,215
    // Log payment of 20,000 for month 1
    const actualPaymentLogs = [{ monthIndex: 1, paidEmi: 20000 }];

    const result = calculateAmortization(baseInput, [], [], actualPaymentLogs);

    const firstRow = result.rows[0];
    expect(firstRow.actualEmiPaid).toBe(20000);
    expect(firstRow.excessEmiPrepayment).toBeGreaterThan(6000);
    expect(firstRow.totalPrincipalPaid).toBe(firstRow.scheduledPrincipalPaid + firstRow.excessEmiPrepayment);
  });

  it('handles lump sum early payoff scenario cleanly', () => {
    const prepaymentRules: PrepaymentRule[] = [
      { id: '1', type: 'ONE_TIME', amount: 1500000, startMonthIndex: 3 }, // More than remaining balance
    ];

    const result = calculateAmortization(baseInput, [], prepaymentRules);

    // Should pay off at Month 3
    expect(result.rows.length).toBe(3);
    expect(result.rows[2].closingBalance).toBe(0);
    expect(result.rows[2].isPayoffMonth).toBe(true);
    expect(result.summary.actualTenureMonths).toBe(3);
    expect(result.summary.monthsSaved).toBe(117);
  });
});
