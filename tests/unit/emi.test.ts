import { describe, expect, it } from 'vitest';
import {
  calculateEmi,
  calculateMonthlyInterest,
  calculateRemainingTenure,
  formatMonthLabel,
  roundToTwoDecimals,
} from '../../src/lib/financial/emi';

describe('EMI Math Utilities', () => {
  it('correctly rounds to two decimal places', () => {
    expect(roundToTwoDecimals(1234.567)).toBe(1234.57);
    expect(roundToTwoDecimals(100.004)).toBe(100);
    expect(roundToTwoDecimals(0)).toBe(0);
  });

  it('calculates standard EMI accurately for a 5,000,000 loan at 8.5% for 20 years', () => {
    const emi = calculateEmi(5000000, 8.5, 240);
    // Standard EMI formula gives approx 43,391.14
    expect(emi).toBeGreaterThan(43390);
    expect(emi).toBeLessThan(43392);
  });

  it('handles 0% interest rate correctly', () => {
    const emi = calculateEmi(120000, 0, 12);
    expect(emi).toBe(10000);
  });

  it('calculates monthly interest accurately', () => {
    // 500,000 principal at 12% annual rate = 1% per month = 5,000
    const interest = calculateMonthlyInterest(500000, 12);
    expect(interest).toBe(5000);
  });

  it('calculates remaining tenure correctly for fixed EMI', () => {
    const tenure = calculateRemainingTenure(1000000, 10, 20000);
    expect(tenure).toBeGreaterThan(0);
    expect(tenure).toBeLessThan(240);
  });

  it('returns Infinity if fixed EMI cannot cover monthly interest', () => {
    // Principal 1,000,000 at 12% interest = 10,000 interest per month. EMI of 5,000 can never pay it off.
    const tenure = calculateRemainingTenure(1000000, 12, 5000);
    expect(tenure).toBe(Infinity);
  });

  it('formats month labels correctly', () => {
    const m1 = formatMonthLabel(1, 2024, 1);
    expect(m1).toEqual({ month: 1, year: 2024, label: 'Jan 2024' });

    const m13 = formatMonthLabel(13, 2024, 1);
    expect(m13).toEqual({ month: 1, year: 2025, label: 'Jan 2025' });

    const m6 = formatMonthLabel(6, 2024, 6); // start June 2024
    expect(m6.label).toBe('Nov 2024');
  });
});
