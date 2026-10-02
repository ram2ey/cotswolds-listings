import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { claimAndScrapeListing } from '@/lib/claim-helper';
import { getErrorMessage } from '@/lib/api-utils';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { after } from 'next/server';

async function recordShopOrder(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const encodedCart = session.metadata?.cart;
  if (!orderId || !encodedCart) throw new Error('Shop order metadata is incomplete.');

  const requested = encodedCart.split(',').map((entry) => {
    const [productId, rawQuantity, fragrance] = entry.split(':');
    return { productId, quantity: Number(rawQuantity), fragrance };
  });
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
  if (lineItems.has_more || lineItems.data.length !== requested.length) {
    throw new Error('Stripe line items do not match the recorded basket.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Supabase service configuration is missing.');
  const supabase = createClient(supabaseUrl, serviceKey);

  const { error: orderError } = await supabase.from('shop_orders').upsert({
    id: orderId,
    stripe_session_id: session.id,
    status: 'paid',
    amount_total_pence: session.amount_total || 0,
    currency: session.currency || 'gbp',
    customer_email: session.customer_details?.email,
    customer_name: session.customer_details?.name,
    shipping_address: session.customer_details?.address,
    paid_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (orderError) throw orderError;

  const orderItems = requested.map((item, index) => {
    const lineItem = lineItems.data[index];
    if (lineItem.quantity !== item.quantity || lineItem.amount_subtotal % item.quantity !== 0) {
      throw new Error('Stripe line item quantity does not match the recorded basket.');
    }
    return {
      order_id: orderId,
      product_id: item.productId,
      fragrance: item.fragrance || '',
      product_name: lineItem.description || item.productId,
      unit_price_pence: lineItem.amount_subtotal / item.quantity,
      quantity: item.quantity,
    };
  });
  const { error: itemsError } = await supabase.from('shop_order_items').upsert(orderItems, { onConflict: 'order_id,product_id,fragrance' });
  if (itemsError) throw itemsError;
}

async function fulfillSubscription(session: Stripe.Checkout.Session) {
  const listingId = session.metadata?.listingId;
  const tier = session.metadata?.tier;
  const website = session.metadata?.website;
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!listingId || !tier || !website || !subscriptionId) throw new Error('Subscription checkout metadata is incomplete.');
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (subscription.status !== 'active' && subscription.status !== 'trialing') return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Supabase service configuration is missing.');
  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: listing, error } = await supabase.from('listings').select('tier,stripe_subscription_id').eq('id', listingId).single();
  if (error || !listing) throw error || new Error('Listing not found.');
  if (listing.stripe_subscription_id === subscriptionId) return;
  if (listing.tier !== 'basic') throw new Error('Listing is already claimed by a different subscription.');

  await claimAndScrapeListing(listingId, tier, website, false, true, subscriptionId);
  after(async () => {
    try {
      await claimAndScrapeListing(listingId, tier, website, true);
    } catch (error) {
      console.error('[stripe-webhook] Listing enrichment failed:', getErrorMessage(error));
    }
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  if (subscription.status !== 'canceled' && subscription.status !== 'unpaid') return;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Supabase service configuration is missing.');
  const supabase = createClient(supabaseUrl, serviceKey);
  const { error } = await supabase.from('listings')
    .update({ tier: 'basic', stripe_subscription_id: null })
    .eq('stripe_subscription_id', subscription.id);
  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!isStripeConfigured() || !webhookSecret) {
    console.error('Stripe credentials are missing or unconfigured.');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = getErrorMessage(err);
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  console.log(`[stripe-webhook] Received event: ${event.type}`);

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') return NextResponse.json({ received: true });

    if (session.metadata?.shopOrder === 'true') {
      try {
        await recordShopOrder(session);
      } catch (error) {
        console.error('[stripe-webhook] Failed to record shop order:', getErrorMessage(error));
        return NextResponse.json({ error: 'Failed to record shop order' }, { status: 500 });
      }
      return NextResponse.json({ received: true });
    }
    
    try {
      await fulfillSubscription(session);
    } catch (error) {
      console.error('[stripe-webhook] Failed to activate subscription:', getErrorMessage(error));
      return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 });
    }
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
    try {
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
    } catch (error) {
      console.error('[stripe-webhook] Failed to update subscription:', getErrorMessage(error));
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
