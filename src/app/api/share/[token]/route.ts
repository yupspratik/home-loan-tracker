import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Share token is required' }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database is not configured for public sharing' },
        { status: 503 }
      );
    }

    const loan = await db.loan.findUnique({
      where: { shareToken: token },
      include: {
        rateChanges: { orderBy: { monthIndex: 'asc' } },
        prepayments: true,
        paymentLogs: { orderBy: { monthIndex: 'asc' } },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Shared loan tracker not found or link has expired' }, { status: 404 });
    }

    const loanState = {
      name: loan.name,
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

    return NextResponse.json({ loanState });
  } catch (error) {
    console.error('Fetch shared loan error:', error);
    return NextResponse.json({ error: 'Failed to load shared loan tracker' }, { status: 500 });
  }
}
