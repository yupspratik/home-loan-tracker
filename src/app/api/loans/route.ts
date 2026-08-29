import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ isDbConfigured: false });
    }

    const loan = await db.loan.findFirst({
      include: {
        rateChanges: { orderBy: { monthIndex: 'asc' } },
        prepayments: true,
        paymentLogs: { orderBy: { monthIndex: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!loan) {
      return NextResponse.json({ isDbConfigured: true, loanState: null });
    }

    const loanState = {
      inputs: {
        loanAmount: loan.loanAmount,
        annualInterestRate: loan.annualInterestRate,
        tenureMonths: loan.tenureMonths,
        startYear: loan.startYear,
        startMonth: loan.startMonth,
        recalculationStrategy: loan.recalculationStrategy as any,
      },
      rateChanges: loan.rateChanges.map((rc: { monthIndex: number; newAnnualRate: number }) => ({
        monthIndex: rc.monthIndex,
        newAnnualRate: rc.newAnnualRate,
      })),
      prepaymentRules: loan.prepayments.map((p: { id: string; type: string; amount: number; startMonthIndex: number; endMonthIndex?: number | null }) => ({
        id: p.id,
        type: p.type as any,
        amount: p.amount,
        startMonthIndex: p.startMonthIndex,
        endMonthIndex: p.endMonthIndex || undefined,
      })),
      actualPaymentLogs: loan.paymentLogs.map((l: { monthIndex: number; paidEmi: number }) => ({
        monthIndex: l.monthIndex,
        paidEmi: l.paidEmi,
      })),
    };

    return NextResponse.json({ isDbConfigured: true, loanState });
  } catch (error) {
    console.error('Supabase DB Fetch Error:', error);
    return NextResponse.json({ isDbConfigured: false, error: 'Database fetch failed' });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL environment variable is not configured.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { inputs, rateChanges = [], prepaymentRules = [], actualPaymentLogs = [] } = body;

    // Find existing primary loan or create new
    const existingLoan = await db.loan.findFirst();

    if (existingLoan) {
      // Clear old nested relations and recreate to sync state cleanly
      await db.$transaction([
        db.rateChange.deleteMany({ where: { loanId: existingLoan.id } }),
        db.prepaymentRule.deleteMany({ where: { loanId: existingLoan.id } }),
        db.paymentLog.deleteMany({ where: { loanId: existingLoan.id } }),
        db.loan.update({
          where: { id: existingLoan.id },
          data: {
            loanAmount: inputs.loanAmount,
            annualInterestRate: inputs.annualInterestRate,
            tenureMonths: inputs.tenureMonths,
            startYear: inputs.startYear || 2024,
            startMonth: inputs.startMonth || 1,
            recalculationStrategy: inputs.recalculationStrategy || 'REDUCE_TENURE',
            rateChanges: {
              create: rateChanges.map((rc: any) => ({
                monthIndex: rc.monthIndex,
                newAnnualRate: rc.newAnnualRate,
              })),
            },
            prepayments: {
              create: prepaymentRules.map((pr: any) => ({
                type: pr.type,
                amount: pr.amount,
                startMonthIndex: pr.startMonthIndex,
                endMonthIndex: pr.endMonthIndex || null,
              })),
            },
            paymentLogs: {
              create: actualPaymentLogs.map((pl: any) => ({
                monthIndex: pl.monthIndex,
                paidEmi: pl.paidEmi,
              })),
            },
          },
        }),
      ]);
    } else {
      await db.loan.create({
        data: {
          name: 'My Home Loan',
          loanAmount: inputs.loanAmount,
          annualInterestRate: inputs.annualInterestRate,
          tenureMonths: inputs.tenureMonths,
          startYear: inputs.startYear || 2024,
          startMonth: inputs.startMonth || 1,
          recalculationStrategy: inputs.recalculationStrategy || 'REDUCE_TENURE',
          rateChanges: {
            create: rateChanges.map((rc: any) => ({
              monthIndex: rc.monthIndex,
              newAnnualRate: rc.newAnnualRate,
            })),
          },
          prepayments: {
            create: prepaymentRules.map((pr: any) => ({
              type: pr.type,
              amount: pr.amount,
              startMonthIndex: pr.startMonthIndex,
              endMonthIndex: pr.endMonthIndex || null,
            })),
          },
          paymentLogs: {
            create: actualPaymentLogs.map((pl: any) => ({
              monthIndex: pl.monthIndex,
              paidEmi: pl.paidEmi,
            })),
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supabase DB Save Error:', error);
    return NextResponse.json({ error: 'Failed to save loan state to Supabase.' }, { status: 500 });
  }
}
