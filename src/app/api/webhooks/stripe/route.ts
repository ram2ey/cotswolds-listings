import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { claimAndScrapeListing } from '@/lib/claim-helper';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret.includes('your-stripe-')) {
    console.error('Stripe webhook secret is missing or unconfigured.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[stripe-webhook] Received event: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Extract metadata defined during session creation
    const listingId = session.metadata?.listingId;
    const tier = session.metadata?.tier;
    const website = session.metadata?.website;

    if (!listingId || !tier || !website) {
      console.error('[stripe-webhook] Missing metadata in checkout session:', session.id);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    console.log(`[stripe-webhook] Payment success for listing: ${listingId}, tier: ${tier}, website: ${website}`);

    // Trigger scraping and AI enrichment asynchronously to avoid Stripe timeout (approx 10s limit)
    claimAndScrapeListing(listingId, tier, website)
      .then((result) => {
        console.log(`[stripe-webhook] Scrape & claim completed successfully for listing ${listingId}`);
      })
      .catch((error) => {
        console.error(`[stripe-webhook] Background claim/scrape failed for listing ${listingId}:`, error.message);
      });
  }

  return NextResponse.json({ received: true });
}
