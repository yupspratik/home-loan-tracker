import { calculateAmortization } from '@/lib/financial/calculator';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inputs, rateChanges = [], prepaymentRules = [], actualPaymentLogs = [] } = body;

    if (!inputs || typeof inputs.loanAmount !== 'number' || typeof inputs.annualInterestRate !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input parameters. loanAmount and annualInterestRate are required.' },
        { status: 400 }
      );
    }

    const result = calculateAmortization(inputs, rateChanges, prepaymentRules, actualPaymentLogs);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Calculation API Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate amortization schedule.' },
      { status: 500 }
    );
  }
}
