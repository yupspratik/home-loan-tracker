import { MonthlyScheduleRow } from './types';

export interface FinancialYearRow {
  fyLabel: string; // e.g. "FY 2024-25"
  fyStartYear: number; // 2024
  startMonthLabel: string; // e.g. "Apr 2024" or "Jan 2024"
  endMonthLabel: string; // e.g. "Mar 2025" or "Dec 2024"
  openingBalance: number;
  totalScheduledEmiPaid: number;
  totalActualEmiPaid: number;
  totalInterestPaid: number;
  totalScheduledPrincipalPaid: number;
  totalLumpsumPrepayment: number;
  totalExcessMonthlyPrepayment: number;
  totalPrepayment: number;
  totalPrincipalPaid: number;
  totalPaymentMade: number;
  closingBalance: number;
  monthsCount: number;
  isCompletedFy: boolean;
}

export function getFinancialYearLabel(month: number, year: number): { fyLabel: string; fyStartYear: number } {
  // If month is Apr (4) to Dec (12): FY is year-(year+1)
  // If month is Jan (1) to Mar (3): FY is (year-1)-year
  if (month >= 4) {
    const nextYearShort = (year + 1).toString().slice(-2);
    return {
      fyLabel: `FY ${year}-${nextYearShort}`,
      fyStartYear: year,
    };
  } else {
    const currYearShort = year.toString().slice(-2);
    return {
      fyLabel: `FY ${year - 1}-${currYearShort}`,
      fyStartYear: year - 1,
    };
  }
}

export function aggregateByFinancialYear(rows: MonthlyScheduleRow[]): FinancialYearRow[] {
  if (!rows || rows.length === 0) return [];

  const fyMap = new Map<string, FinancialYearRow>();

  for (const row of rows) {
    const { fyLabel, fyStartYear } = getFinancialYearLabel(row.month, row.year);

    if (!fyMap.has(fyLabel)) {
      fyMap.set(fyLabel, {
        fyLabel,
        fyStartYear,
        startMonthLabel: row.monthLabel,
        endMonthLabel: row.monthLabel,
        openingBalance: row.openingBalance,
        totalScheduledEmiPaid: 0,
        totalActualEmiPaid: 0,
        totalInterestPaid: 0,
        totalScheduledPrincipalPaid: 0,
        totalLumpsumPrepayment: 0,
        totalExcessMonthlyPrepayment: 0,
        totalPrepayment: 0,
        totalPrincipalPaid: 0,
        totalPaymentMade: 0,
        closingBalance: row.closingBalance,
        monthsCount: 0,
        isCompletedFy: false,
      });
    }

    const fy = fyMap.get(fyLabel)!;
    fy.endMonthLabel = row.monthLabel;
    fy.totalScheduledEmiPaid += row.scheduledEmi;
    fy.totalActualEmiPaid += row.actualEmiPaid;
    fy.totalInterestPaid += row.interestPaid;
    fy.totalScheduledPrincipalPaid += row.scheduledPrincipalPaid;
    fy.totalLumpsumPrepayment += row.rulePrepayment;
    fy.totalExcessMonthlyPrepayment += row.excessEmiPrepayment;
    fy.totalPrepayment += row.totalPrepayment;
    fy.totalPrincipalPaid += row.totalPrincipalPaid;
    fy.totalPaymentMade += row.interestPaid + row.totalPrincipalPaid;
    fy.closingBalance = row.closingBalance;
    fy.monthsCount += 1;
    fy.isCompletedFy = fy.monthsCount === 12;
  }

  // Round values
  const result: FinancialYearRow[] = [];
  for (const fy of fyMap.values()) {
    result.push({
      ...fy,
      openingBalance: Math.round(fy.openingBalance),
      totalScheduledEmiPaid: Math.round(fy.totalScheduledEmiPaid),
      totalActualEmiPaid: Math.round(fy.totalActualEmiPaid),
      totalInterestPaid: Math.round(fy.totalInterestPaid),
      totalScheduledPrincipalPaid: Math.round(fy.totalScheduledPrincipalPaid),
      totalLumpsumPrepayment: Math.round(fy.totalLumpsumPrepayment),
      totalExcessMonthlyPrepayment: Math.round(fy.totalExcessMonthlyPrepayment),
      totalPrepayment: Math.round(fy.totalPrepayment),
      totalPrincipalPaid: Math.round(fy.totalPrincipalPaid),
      totalPaymentMade: Math.round(fy.totalPaymentMade),
      closingBalance: Math.round(fy.closingBalance),
    });
  }

  return result.sort((a, b) => a.fyStartYear - b.fyStartYear);
}
