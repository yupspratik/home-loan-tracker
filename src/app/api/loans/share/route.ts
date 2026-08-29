import { db } from '@/lib/db';
import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database must be configured in Supabase to create share links.' },
        { status: 400 }
      );
    }

    let loan = await db.loan.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!loan) {
      return NextResponse.json({ error: 'No active loan found to share.' }, { status: 404 });
    }

    let shareToken = loan.shareToken;

    if (!shareToken) {
      shareToken = randomBytes(8).toString('hex');
      loan = await db.loan.update({
        where: { id: loan.id },
        data: { shareToken },
      });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const shareUrl = `${protocol}://${host}/share/${shareToken}`;

    return NextResponse.json({ shareToken, shareUrl });
  } catch (error) {
    console.error('Generate share token error:', error);
    return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 });
  }
}
