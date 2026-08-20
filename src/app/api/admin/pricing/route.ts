import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionPlans, updateSubscriptionPlan, DEFAULT_PLANS } from '@/lib/plans';
import { verifyAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized administrative access.' }, { status: 401 });
  }

  try {
    const plans = await getSubscriptionPlans(true);
    return NextResponse.json(plans);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch admin pricing plans' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized administrative access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, price_monthly_gbp, name, description, is_active, reset_all } = body;

    // Support batch reset to defaults
    if (reset_all) {
      const updated = [];
      for (const defPlan of DEFAULT_PLANS) {
        const res = await updateSubscriptionPlan(defPlan.id, {
          price_monthly_gbp: defPlan.price_monthly_gbp,
          name: defPlan.name,
          description: defPlan.description,
          is_active: defPlan.is_active,
        });
        updated.push(res);
      }
      return NextResponse.json({ success: true, message: 'All subscription plans reset to default pricing.', data: updated });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required plan ID' },
        { status: 400 }
      );
    }

    if (price_monthly_gbp !== undefined && (isNaN(Number(price_monthly_gbp)) || Number(price_monthly_gbp) < 0)) {
      return NextResponse.json(
        { error: 'Price must be a valid positive number' },
        { status: 400 }
      );
    }

    const updatedPlan = await updateSubscriptionPlan(id, {
      ...(price_monthly_gbp !== undefined && { price_monthly_gbp: Number(price_monthly_gbp) }),
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(is_active !== undefined && { is_active }),
    });

    return NextResponse.json({
      success: true,
      message: `Updated pricing for ${updatedPlan.name} to £${updatedPlan.price_monthly_gbp}/mo.`,
      data: updatedPlan,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update plan pricing' },
      { status: 500 }
    );
  }
}

