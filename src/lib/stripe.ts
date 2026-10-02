import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export const hasStripeSecretKey = () => /^sk_(test|live)_[A-Za-z0-9]+$/.test(stripeSecretKey);
export const hasStripeWebhookSecret = () => /^whsec_[A-Za-z0-9]+$/.test(webhookSecret);
export const isStripeConfigured = () => hasStripeSecretKey() && hasStripeWebhookSecret();

// This fallback only lets the module load. Payment routes reject missing
// configuration before calling Stripe; it never enables a simulated checkout.
export const stripe = new Stripe(
  hasStripeSecretKey() ? stripeSecretKey : 'sk_test_unconfigured',
  {
    apiVersion: '2022-11-15' as Stripe.LatestApiVersion, // Standard stable API version
  }
);
