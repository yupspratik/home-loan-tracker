/**
 * Utility functions for EMI and interest calculations.
 */

export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates standard Equated Monthly Installment (EMI).
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEmi(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;

  const monthlyRate = annualInterestRate / 12 / 100;

  if (monthlyRate === 0) {
    return roundToTwoDecimals(principal / tenureMonths);
  }

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  return roundToTwoDecimals(emi);
}

/**
 * Calculates monthly interest amount for a given principal and interest rate.
 */
export function calculateMonthlyInterest(
  principal: number,
  annualInterestRate: number
): number {
  if (principal <= 0 || annualInterestRate <= 0) return 0;
  const monthlyRate = annualInterestRate / 12 / 100;
  return roundToTwoDecimals(principal * monthlyRate);
}

/**
 * Calculates remaining months required to pay off principal with a given fixed EMI.
 * n = -log(1 - (r * P) / EMI) / log(1 + r)
 */
export function calculateRemainingTenure(
  principal: number,
  annualInterestRate: number,
  emi: number
): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualInterestRate / 12 / 100;

  if (monthlyRate === 0) {
    return Math.ceil(principal / emi);
  }

  const interestForFirstMonth = principal * monthlyRate;
  if (emi <= interestForFirstMonth) {
    // If EMI cannot cover interest, loan will never finish
    return Infinity;
  }

  const numMonths =
    -Math.log(1 - (monthlyRate * principal) / emi) / Math.log(1 + monthlyRate);

  return Math.ceil(numMonths);
}

/**
 * Format month index (1-based) to Month Year label (e.g. 1 -> "Jan 2024")
 */
export function formatMonthLabel(
  monthIndex: number,
  startYear: number = 2024,
  startMonth: number = 1
): { month: number; year: number; label: string } {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const totalMonthsFromZero = startMonth - 1 + (monthIndex - 1);
  const month0Index = totalMonthsFromZero % 12;
  const yearOffset = Math.floor(totalMonthsFromZero / 12);
  const actualYear = startYear + yearOffset;
  const monthNumber = month0Index + 1;

  return {
    month: monthNumber,
    year: actualYear,
    label: `${monthNames[month0Index]} ${actualYear}`,
  };
}
