import { NextResponse } from 'next/server';
import { getSubscriptionPlans } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = await getSubscriptionPlans(false);
    return NextResponse.json(plans);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch pricing plans' },
      { status: 500 }
    );
  }
}
