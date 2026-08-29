export interface PrepayVsInvestInput {
  prepaymentAmount: number;
  isMonthlySip: boolean; // true = monthly extra, false = lump sum
  loanInterestRate: number; // e.g. 8.5%
  expectedInvestmentRoi: number; // e.g. 12%
  horizonYears: number; // e.g. 10 years
}

export interface PrepayVsInvestResult {
  totalPrepaymentInvested: number;
  guaranteedInterestSavedFromPrepayment: number;
  investmentFutureValue: number;
  netInvestmentGainOverPrepayment: number;
  breakevenRoi: number;
  recommendation: 'PREPAY' | 'INVEST' | 'EQUIVALENT';
  recommendationReason: string;
}

export function simulatePrepayVsInvest(input: PrepayVsInvestInput): PrepayVsInvestResult {
  const { prepaymentAmount, isMonthlySip, loanInterestRate, expectedInvestmentRoi, horizonYears } = input;
  const months = horizonYears * 12;

  let totalPrepaymentInvested = 0;
  let investmentFutureValue = 0;
  let guaranteedInterestSavedFromPrepayment = 0;

  const monthlyLoanRate = loanInterestRate / 100 / 12;
  const monthlyInvRate = expectedInvestmentRoi / 100 / 12;

  if (isMonthlySip) {
    totalPrepaymentInvested = prepaymentAmount * months;
    // Compound interest for SIP: FV = P * [((1+r)^n - 1)/r] * (1+r)
    if (monthlyInvRate > 0) {
      investmentFutureValue =
        prepaymentAmount *
        (((Math.pow(1 + monthlyInvRate, months) - 1) / monthlyInvRate) * (1 + monthlyInvRate));
    } else {
      investmentFutureValue = totalPrepaymentInvested;
    }

    // Compound interest saved from paying extra loan principal
    if (monthlyLoanRate > 0) {
      const loanFvOfPayments =
        prepaymentAmount *
        (((Math.pow(1 + monthlyLoanRate, months) - 1) / monthlyLoanRate) * (1 + monthlyLoanRate));
      guaranteedInterestSavedFromPrepayment = loanFvOfPayments - totalPrepaymentInvested;
    }
  } else {
    // Lump Sum
    totalPrepaymentInvested = prepaymentAmount;
    investmentFutureValue = prepaymentAmount * Math.pow(1 + expectedInvestmentRoi / 100, horizonYears);

    const loanFv = prepaymentAmount * Math.pow(1 + loanInterestRate / 100, horizonYears);
    guaranteedInterestSavedFromPrepayment = loanFv - prepaymentAmount;
  }

  const netInvestmentGainOverPrepayment = investmentFutureValue - (totalPrepaymentInvested + guaranteedInterestSavedFromPrepayment);
  const breakevenRoi = loanInterestRate;

  let recommendation: 'PREPAY' | 'INVEST' | 'EQUIVALENT' = 'EQUIVALENT';
  let recommendationReason = '';

  if (expectedInvestmentRoi > loanInterestRate + 1.5) {
    recommendation = 'INVEST';
    recommendationReason = `Investing at expected ${expectedInvestmentRoi}% p.a. generates higher estimated wealth (+₹${Math.round(Math.max(0, netInvestmentGainOverPrepayment)).toLocaleString('en-IN')}) than guaranteed ${loanInterestRate}% interest savings.`;
  } else if (expectedInvestmentRoi < loanInterestRate) {
    recommendation = 'PREPAY';
    recommendationReason = `Prepaying your ${loanInterestRate}% home loan offers a guaranteed risk-free return of ${loanInterestRate}%, beating expected ${expectedInvestmentRoi}% investment return.`;
  } else {
    recommendation = 'EQUIVALENT';
    recommendationReason = `Returns are comparable. Prepaying offers guaranteed debt reduction, while investing provides liquidity.`;
  }

  return {
    totalPrepaymentInvested: Math.round(totalPrepaymentInvested),
    guaranteedInterestSavedFromPrepayment: Math.round(guaranteedInterestSavedFromPrepayment),
    investmentFutureValue: Math.round(investmentFutureValue),
    netInvestmentGainOverPrepayment: Math.round(netInvestmentGainOverPrepayment),
    breakevenRoi,
    recommendation,
    recommendationReason,
  };
}

export interface BalanceTransferInput {
  currentBalance: number;
  currentRate: number;
  newRate: number;
  remainingTenureMonths: number;
  processingFeePercentage: number;
  flatProcessingFee: number;
}

export interface BalanceTransferResult {
  currentEmi: number;
  newEmi: number;
  monthlyEmiSavings: number;
  totalGrossInterestSavings: number;
  totalTransferCost: number;
  netLifetimeSavings: number;
  paybackPeriodMonths: number;
  isViable: boolean;
}

export function simulateBalanceTransfer(input: BalanceTransferInput): BalanceTransferResult {
  const { currentBalance, currentRate, newRate, remainingTenureMonths, processingFeePercentage, flatProcessingFee } = input;

  const calculateEmi = (p: number, rAnnual: number, n: number) => {
    if (rAnnual <= 0 || n <= 0) return p / Math.max(1, n);
    const r = rAnnual / 100 / 12;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const currentEmi = calculateEmi(currentBalance, currentRate, remainingTenureMonths);
  const newEmi = calculateEmi(currentBalance, newRate, remainingTenureMonths);
  const monthlyEmiSavings = currentEmi - newEmi;

  const currentTotalPayment = currentEmi * remainingTenureMonths;
  const newTotalPayment = newEmi * remainingTenureMonths;
  const totalGrossInterestSavings = currentTotalPayment - newTotalPayment;

  const percentageFeeCost = (currentBalance * processingFeePercentage) / 100;
  const totalTransferCost = percentageFeeCost + flatProcessingFee;

  const netLifetimeSavings = totalGrossInterestSavings - totalTransferCost;
  const paybackPeriodMonths = monthlyEmiSavings > 0 ? Math.ceil(totalTransferCost / monthlyEmiSavings) : 0;
  const isViable = netLifetimeSavings > 0;

  return {
    currentEmi: Math.round(currentEmi),
    newEmi: Math.round(newEmi),
    monthlyEmiSavings: Math.round(monthlyEmiSavings),
    totalGrossInterestSavings: Math.round(totalGrossInterestSavings),
    totalTransferCost: Math.round(totalTransferCost),
    netLifetimeSavings: Math.round(netLifetimeSavings),
    paybackPeriodMonths,
    isViable,
  };
}
