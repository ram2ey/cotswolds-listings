import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { claimAndScrapeListing } from '@/lib/claim-helper';
import { getErrorMessage } from '@/lib/api-utils';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getShopProductsByIds } from '@/lib/shop';

async function recordShopOrder(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const encodedCart = session.metadata?.cart;
  if (!orderId || !encodedCart) throw new Error('Shop order metadata is incomplete.');

  const requested = encodedCart.split(',').map((entry) => {
    const [productId, rawQuantity, fragrance] = entry.split(':');
    return { productId, quantity: Number(rawQuantity), fragrance };
  });
  const products = await getShopProductsByIds(requested.map((item) => item.productId));
  const productMap = new Map(products.map((product) => [product.id, product]));

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

  const orderItems = requested.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Product ${item.productId} was not found while recording order.`);
    return {
      order_id: orderId,
      product_id: product.id,
      product_name: item.fragrance ? `${product.name} (${item.fragrance})` : product.name,
      unit_price_pence: Math.round(product.price_gbp * 100),
      quantity: item.quantity,
    };
  });
  const { error: itemsError } = await supabase.from('shop_order_items').upsert(orderItems, { onConflict: 'order_id,product_id' });
  if (itemsError) throw itemsError;
}

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
  } catch (err) {
    const message = getErrorMessage(err);
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  console.log(`[stripe-webhook] Received event: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata?.shopOrder === 'true') {
      try {
        await recordShopOrder(session);
      } catch (error) {
        console.error('[stripe-webhook] Failed to record shop order:', getErrorMessage(error));
        return NextResponse.json({ error: 'Failed to record shop order' }, { status: 500 });
      }
      return NextResponse.json({ received: true });
    }
    
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
      .then(() => {
        console.log(`[stripe-webhook] Scrape & claim completed successfully for listing ${listingId}`);
      })
      .catch((error) => {
        console.error(`[stripe-webhook] Background claim/scrape failed for listing ${listingId}:`, getErrorMessage(error));
      });
  }

  return NextResponse.json({ received: true });
}
