import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      console.error('[checkout-session] Stripe credentials are not configured.');
      return NextResponse.json({ error: 'Checkout is temporarily unavailable.' }, { status: 503 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-project')) {
      return NextResponse.json({ error: 'Checkout is temporarily unavailable.' }, { status: 503 });
    }

    const { listingId, tier, website } = await request.json();

    if (!listingId || !tier || !website) {
      return NextResponse.json(
        { error: 'Missing required parameters: listingId, tier, and website are required.' },
        { status: 400 }
      );
    }

    const validPlans = ['claim', 'gold', 'gold_social', 'featured', 'featured_social'];
    if (!validPlans.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid plan selected. Must be claim, gold, gold_social, featured, or featured_social.' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans').select('*').eq('id', tier).single();
    if (planError) throw planError;
    if (!plan || !plan.is_active || !Number.isFinite(Number(plan.price_monthly_gbp)) || Number(plan.price_monthly_gbp) <= 0) {
      return NextResponse.json(
        { error: 'Selected subscription plan is not available.' },
        { status: 400 }
      );
    }

    // Fetch listing details to obtain its slug
    let slug = 'unknown';
    {
      const { data, error } = await supabase
        .from('listings')
        .select('slug, tier')
        .eq('id', listingId)
        .single();

      if (error || !data) {
        console.error('Error fetching listing slug:', error?.message);
        return NextResponse.json({ error: 'Listing not found in database.' }, { status: 404 });
      }

      // Refuse to take payment to "claim" a listing that's already claimed —
      // the final atomic guard lives in claimAndScrapeListing, but checking
      // here avoids charging a card for a claim that will be rejected later.
      if (data.tier && data.tier !== 'basic') {
        return NextResponse.json(
          { error: 'This listing has already been claimed. Please contact support if you believe this is an error.' },
          { status: 409 }
        );
      }

      slug = data.slug;
    }

    const origin = request.nextUrl.origin;

    // Real Stripe Flow with dynamic price_data
    const unitAmountPence = Math.round(plan.price_monthly_gbp * 100);
    console.log(`[checkout-session] Creating Stripe Checkout session for listing: ${listingId}, plan: ${plan.name}, price: £${plan.price_monthly_gbp}/mo (${unitAmountPence}p)`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Cotswolds Pages - ${plan.name}`,
              description: plan.description,
            },
            unit_amount: unitAmountPence,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        listingId,
        tier,
        website,
      },
      subscription_data: { metadata: { listingId, tier, website } },
      success_url: `${origin}/listings/claim/success?session_id={CHECKOUT_SESSION_ID}&slug=${slug}`,
      cancel_url: `${origin}/listings/${slug}`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (err) {
    return errorResponse(err, 500, 'Internal Server Error', 'checkout-session');
  }
}

