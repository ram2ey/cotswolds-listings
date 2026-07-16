import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

// Determine if Stripe configuration is missing or using placeholder values
export const isStripeMock = (): boolean => {
  return (
    !stripeSecretKey ||
    stripeSecretKey.trim() === '' ||
    stripeSecretKey.includes('your-stripe-secret-key-here')
  );
};

// Initialize the Stripe client. In mock mode, we pass a dummy key to prevent initialization exceptions.
export const stripe = new Stripe(
  isStripeMock() ? 'sk_test_mock_placeholder_key_for_cotswolds_pages' : stripeSecretKey,
  {
    apiVersion: '2022-11-15' as any, // Standard stable API version
  }
);
