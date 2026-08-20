import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe, isStripeMock } from '@/lib/stripe';
import { claimAndScrapeListing } from '@/lib/claim-helper';
import { getSubscriptionPlan } from '@/lib/plans';

export async function POST(request: NextRequest) {
  try {
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

    const plan = await getSubscriptionPlan(tier);
    if (!plan || !plan.is_active) {
      return NextResponse.json(
        { error: 'Selected subscription plan is not available.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isMockDB = !supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-supabase-url-here');

    // Fetch listing details to obtain its slug
    let slug = 'unknown';
    if (!isMockDB) {
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
      const { data, error } = await supabase
        .from('listings')
        .select('slug')
        .eq('id', listingId)
        .single();

      if (error || !data) {
        console.error('Error fetching listing slug:', error?.message);
        return NextResponse.json({ error: 'Listing not found in database.' }, { status: 404 });
      }
      slug = data.slug;
    } else {
      slug = 'broadway-hotel-suites-broadway'; // Fallback slug for offline mock testing
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    if (isStripeMock()) {
      console.log(`[checkout-session] Running in MOCK mode. Plan: ${plan.name} (£${plan.price_monthly_gbp}/mo), Website: ${website}`);
      
      // For mock mode, run the claim/enrich scrape immediately in the background
      // so the local DB is updated when they redirect to the success screen
      claimAndScrapeListing(listingId, tier, website).catch((err) => {
        console.error('[checkout-session] Mock claim background execution failed:', err.message);
      });

      const mockSessionId = 'mock_sess_' + Math.random().toString(36).substr(2, 9);
      const redirectUrl = `${origin}/listings/claim/success?session_id=${mockSessionId}&slug=${slug}`;
      
      return NextResponse.json({
        mockRedirect: true,
        url: redirectUrl,
      });
    }

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
      success_url: `${origin}/listings/claim/success?session_id={CHECKOUT_SESSION_ID}&slug=${slug}`,
      cancel_url: `${origin}/listings/${slug}`,
    });

    return NextResponse.json({
      mockRedirect: false,
      url: session.url,
    });
  } catch (err: any) {
    console.error('Error creating checkout session:', err.message);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

