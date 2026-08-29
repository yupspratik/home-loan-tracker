import {
  calculateEmi,
  calculateMonthlyInterest,
  formatMonthLabel,
  roundToTwoDecimals,
} from './emi';
import {
  ActualPaymentLog,
  AmortizationResult,
  InterestRateChange,
  LoanInputs,
  LoanSummary,
  MonthlyScheduleRow,
  PrepaymentRule,
} from './types';

/**
 * Calculates rule-based prepayments active for a given month.
 */
export function getPrepaymentForMonth(
  monthIndex: number,
  rules: PrepaymentRule[]
): number {
  let totalRulePrepayment = 0;

  for (const rule of rules) {
    if (monthIndex < rule.startMonthIndex) continue;
    if (rule.endMonthIndex && monthIndex > rule.endMonthIndex) continue;

    const offset = monthIndex - rule.startMonthIndex;

    switch (rule.type) {
      case 'ONE_TIME':
        if (monthIndex === rule.startMonthIndex) {
          totalRulePrepayment += rule.amount;
        }
        break;

      case 'MONTHLY':
        totalRulePrepayment += rule.amount;
        break;

      case 'QUARTERLY':
        if (offset % 3 === 0) {
          totalRulePrepayment += rule.amount;
        }
        break;

      case 'HALF_YEARLY':
        if (offset % 6 === 0) {
          totalRulePrepayment += rule.amount;
        }
        break;

      case 'YEARLY':
        if (offset % 12 === 0) {
          totalRulePrepayment += rule.amount;
        }
        break;
    }
  }

  return roundToTwoDecimals(totalRulePrepayment);
}

/**
 * Generate full amortization schedule and summary metrics.
 */
export function calculateAmortization(
  inputs: LoanInputs,
  rateChanges: InterestRateChange[] = [],
  prepaymentRules: PrepaymentRule[] = [],
  actualPaymentLogs: ActualPaymentLog[] = []
): AmortizationResult {
  const {
    loanAmount,
    annualInterestRate,
    tenureMonths,
    startYear = new Date().getFullYear(),
    startMonth = 1,
    recalculationStrategy = 'REDUCE_TENURE',
  } = inputs;

  if (loanAmount <= 0 || tenureMonths <= 0 || annualInterestRate <= 0) {
    const emptySummary: LoanSummary = {
      initialLoanAmount: loanAmount,
      originalInterestRate: annualInterestRate,
      originalTenureMonths: tenureMonths,
      actualTenureMonths: 0,
      monthsSaved: 0,
      originalTotalInterest: 0,
      actualTotalInterest: 0,
      interestSaved: 0,
      totalAmountPaid: 0,
      totalPrepaymentsMade: 0,
      originalPayoffLabel: formatMonthLabel(tenureMonths, startYear, startMonth).label,
      projectedPayoffLabel: formatMonthLabel(0, startYear, startMonth).label,
      currentBalance: 0,
      currentAsOfLabel: 'N/A',
      currentPaidPrincipalSoFar: 0,
      currentPaidInterestSoFar: 0,
    };
    return { rows: [], summary: emptySummary };
  }

  // Quick lookup maps
  const rateChangeMap = new Map<number, number>();
  for (const rc of rateChanges) {
    rateChangeMap.set(rc.monthIndex, rc.newAnnualRate);
  }

  const paymentLogMap = new Map<number, number>();
  for (const log of actualPaymentLogs) {
    paymentLogMap.set(log.monthIndex, log.paidEmi);
  }

  // --- Step 1: Compute Baseline (No Prepayments) for accurate Comparison ---
  let baselineOpening = loanAmount;
  let baselineRate = annualInterestRate;
  let baselineTotalInterest = 0;
  let baselineCurrentEmi = calculateEmi(loanAmount, baselineRate, tenureMonths);
  let baselineMonthsCount = 0;

  for (let m = 1; m <= 600; m++) {
    if (baselineOpening <= 0.01) break;
    baselineMonthsCount = m;

    if (rateChangeMap.has(m)) {
      baselineRate = rateChangeMap.get(m)!;
      const remainingMonths = Math.max(1, tenureMonths - m + 1);
      baselineCurrentEmi = calculateEmi(baselineOpening, baselineRate, remainingMonths);
    }

    const interest = calculateMonthlyInterest(baselineOpening, baselineRate);
    baselineTotalInterest += interest;

    let principal = Math.max(0, baselineCurrentEmi - interest);
    if (principal >= baselineOpening || m === tenureMonths) {
      principal = baselineOpening;
    }
    baselineOpening = roundToTwoDecimals(Math.max(0, baselineOpening - principal));
  }

  const baselinePayoffLabel = formatMonthLabel(
    baselineMonthsCount,
    startYear,
    startMonth
  ).label;

  // --- Step 2: Main Calculation Loop (With Prepayments, Rate Changes & Excess EMI) ---
  const rows: MonthlyScheduleRow[] = [];
  let openingBalance = loanAmount;
  let currentRate = annualInterestRate;
  let activeScheduledEmi = calculateEmi(loanAmount, currentRate, tenureMonths);
  let currentTenureRemaining = tenureMonths;

  let actualTotalInterest = 0;
  let totalPrepaymentsMade = 0;
  let actualTotalAmountPaid = 0;

  // Safety limit: 600 months (50 years)
  for (let monthIndex = 1; monthIndex <= 600; monthIndex++) {
    if (openingBalance <= 0.01) break;

    // 1. Check Rate Change
    let isRateChangedThisMonth = false;
    if (rateChangeMap.has(monthIndex)) {
      currentRate = rateChangeMap.get(monthIndex)!;
      isRateChangedThisMonth = true;
    }

    currentTenureRemaining = Math.max(1, tenureMonths - monthIndex + 1);

    // 2. Adjust EMI if needed
    if (recalculationStrategy === 'REDUCE_EMI') {
      activeScheduledEmi = calculateEmi(
        openingBalance,
        currentRate,
        currentTenureRemaining
      );
    } else {
      // REDUCE_TENURE: Keep EMI constant (at initial calculated EMI), unless rate increased so much that interest exceeds current EMI
      const monthlyInterest = calculateMonthlyInterest(openingBalance, currentRate);
      if (activeScheduledEmi <= monthlyInterest) {
        // If interest increased beyond EMI, update EMI to minimum required
        activeScheduledEmi = calculateEmi(
          openingBalance,
          currentRate,
          currentTenureRemaining
        );
      }
    }

    // 3. Interest for this month
    const interestPaid = calculateMonthlyInterest(openingBalance, currentRate);

    // 4. Actual EMI logged or scheduled
    const loggedEmi = paymentLogMap.get(monthIndex);
    const actualEmiPaid = loggedEmi !== undefined ? loggedEmi : activeScheduledEmi;

    // 5. Principal paid from EMI
    let scheduledPrincipalPaid = Math.max(0, actualEmiPaid - interestPaid);

    // If remaining principal is less than or equal to scheduled principal paid (or final scheduled month),
    // cap scheduledPrincipalPaid to exact openingBalance to close loan cleanly.
    if (scheduledPrincipalPaid >= openingBalance || monthIndex === tenureMonths && actualEmiPaid >= activeScheduledEmi) {
      scheduledPrincipalPaid = openingBalance;
    }

    // 6. Excess EMI prepayment
    const excessEmiPrepayment = Math.max(0, actualEmiPaid - activeScheduledEmi);

    // 7. Rule Prepayment (1-time, monthly, quarterly, etc.)
    const rulePrepayment = getPrepaymentForMonth(monthIndex, prepaymentRules);

    // 8. Total prepayment & Total Principal
    let totalPrepayment = roundToTwoDecimals(excessEmiPrepayment + rulePrepayment);

    // Cap total prepayment to remaining balance after standard principal
    const remainingBalanceAfterStandard = Math.max(
      0,
      openingBalance - scheduledPrincipalPaid
    );
    if (totalPrepayment > remainingBalanceAfterStandard) {
      totalPrepayment = roundToTwoDecimals(remainingBalanceAfterStandard);
    }

    const totalPrincipalPaid = roundToTwoDecimals(
      scheduledPrincipalPaid + totalPrepayment
    );

    // 9. Closing balance
    const closingBalance = roundToTwoDecimals(
      Math.max(0, openingBalance - totalPrincipalPaid)
    );

    // 10. Record row
    const monthDetails = formatMonthLabel(monthIndex, startYear, startMonth);
    const isPayoffMonth = closingBalance <= 0.01;

    rows.push({
      monthIndex,
      year: monthDetails.year,
      month: monthDetails.month,
      monthLabel: monthDetails.label,
      openingBalance,
      interestRate: currentRate,
      scheduledEmi: activeScheduledEmi,
      actualEmiPaid,
      interestPaid,
      scheduledPrincipalPaid,
      excessEmiPrepayment,
      rulePrepayment,
      totalPrepayment,
      totalPrincipalPaid,
      closingBalance,
      isPayoffMonth,
    });

    // Accumulate totals
    actualTotalInterest += interestPaid;
    totalPrepaymentsMade += totalPrepayment;
    actualTotalAmountPaid += interestPaid + totalPrincipalPaid;

    // Prepare for next month
    openingBalance = closingBalance;

    if (isPayoffMonth) break;
  }

  const actualTenureMonths = rows.length;
  const projectedPayoffLabel =
    actualTenureMonths > 0
      ? rows[rows.length - 1].monthLabel
      : formatMonthLabel(0, startYear, startMonth).label;

  const monthsSaved = Math.max(0, baselineMonthsCount - actualTenureMonths);
  const interestSaved = roundToTwoDecimals(
    Math.max(0, baselineTotalInterest - actualTotalInterest)
  );

  // --- Step 3: Compute Real-World Current Month Balance ---
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth() + 1; // 1-12 (e.g. 8 for Aug)

  const currentMonthIndex = (todayYear - startYear) * 12 + (todayMonth - startMonth) + 1;

  let currentBalance = 0;
  let currentAsOfLabel = '';
  let currentPaidPrincipalSoFar = 0;
  let currentPaidInterestSoFar = 0;

  if (currentMonthIndex < 1) {
    // Future loan start date
    currentBalance = loanAmount;
    currentAsOfLabel = `Starts ${formatMonthLabel(1, startYear, startMonth).label}`;
    currentPaidPrincipalSoFar = 0;
    currentPaidInterestSoFar = 0;
  } else if (currentMonthIndex > rows.length) {
    // Fully paid off already
    currentBalance = 0;
    currentAsOfLabel = `Paid Off (${rows.length > 0 ? rows[rows.length - 1].monthLabel : ''})`;
    currentPaidPrincipalSoFar = loanAmount;
    currentPaidInterestSoFar = roundToTwoDecimals(actualTotalInterest);
  } else {
    // Active loan month as of today's date
    const currentRow = rows[currentMonthIndex - 1];
    currentBalance = currentRow.closingBalance;
    currentAsOfLabel = `As of ${currentRow.monthLabel} (Month ${currentRow.monthIndex})`;

    for (let i = 0; i < currentMonthIndex; i++) {
      currentPaidPrincipalSoFar += rows[i].totalPrincipalPaid;
      currentPaidInterestSoFar += rows[i].interestPaid;
    }
    currentPaidPrincipalSoFar = roundToTwoDecimals(currentPaidPrincipalSoFar);
    currentPaidInterestSoFar = roundToTwoDecimals(currentPaidInterestSoFar);
  }

  const summary: LoanSummary = {
    initialLoanAmount: loanAmount,
    originalInterestRate: annualInterestRate,
    originalTenureMonths: tenureMonths,
    actualTenureMonths,
    monthsSaved,
    originalTotalInterest: roundToTwoDecimals(baselineTotalInterest),
    actualTotalInterest: roundToTwoDecimals(actualTotalInterest),
    interestSaved,
    totalAmountPaid: roundToTwoDecimals(actualTotalAmountPaid),
    totalPrepaymentsMade: roundToTwoDecimals(totalPrepaymentsMade),
    originalPayoffLabel: baselinePayoffLabel,
    projectedPayoffLabel,
    currentBalance,
    currentAsOfLabel,
    currentPaidPrincipalSoFar,
    currentPaidInterestSoFar,
  };

  return { rows, summary };
}
