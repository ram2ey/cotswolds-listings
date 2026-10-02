This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Stripe on Vercel

The listing subscription and candle shop both require server-side Stripe credentials. In the Vercel project, add these under **Settings → Environment Variables** for the deployment environment in use:

```dotenv
STRIPE_SECRET_KEY=sk_test_...       # Use the matching live key for production payments
STRIPE_WEBHOOK_SECRET=whsec_...     # Signing secret for this environment's webhook endpoint
```

Apply `stripe-migration.sql` to the existing Supabase database before enabling payments. Create a Stripe webhook endpoint at `https://YOUR_DOMAIN/api/webhooks/stripe` and subscribe it to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.updated`, and `customer.subscription.deleted`. Test and live mode use separate API keys and webhook signing secrets. A publishable key is not needed by the current server-created Stripe Checkout flow. Redeploy after changing Vercel variables; they do not update an existing deployment.

With either credential absent, the checkout endpoints return HTTP 503 and no payment or listing claim is started. Use Stripe test mode to verify one listing checkout and one shop checkout, including successful webhook delivery, before adding live credentials.

Do not put secret keys in `NEXT_PUBLIC_` variables or commit them to the repository.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
