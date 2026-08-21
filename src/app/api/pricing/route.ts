import { NextResponse } from 'next/server';
import { getSubscriptionPlans } from '@/lib/plans';
import { errorResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = await getSubscriptionPlans(false);
    return NextResponse.json(plans);
  } catch (err) {
    return errorResponse(err, 500, 'Failed to fetch pricing plans', 'pricing');
  }
}
