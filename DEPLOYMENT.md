# Coolify deployment on Hetzner

This application is packaged as a single production Next.js container. Supabase and Stripe remain external managed services, so the application container does not require a persistent volume.

## 1. Server prerequisites

- A Hetzner server connected to a working Coolify instance.
- A domain with an `A` record pointing to the Hetzner server's public IPv4 address. Add an `AAAA` record only when IPv6 is configured correctly.
- Ports 80 and 443 reachable by Coolify's proxy.
- The repository available to Coolify through a Git integration, public URL, or deploy key.

## 2. Create the Coolify application

In the target Coolify project and environment:

1. Select **New Resource → Application** and connect this Git repository.
2. Select the production branch.
3. Choose **Dockerfile** as the build pack.
4. Set **Base Directory** to `/`.
5. Set **Dockerfile Location** to `/Dockerfile`.
6. Set **Ports Exposes** to `3000`.
7. Add the public domain, for example `https://example.com`.

The image contains its own health check at `GET /api/health`. Coolify detects the Dockerfile `HEALTHCHECK`; do not configure a second dashboard health check unless the Dockerfile check is removed.

The server listens on `0.0.0.0:3000`, as required for the Coolify proxy.

## 3. Add environment variables

Copy the names from `.env.example` into **Configuration → Environment Variables**. Never commit real values.

Required for the live site and admin:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Required for real payments:

```dotenv
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Recommended:

```dotenv
CRON_SECRET=
```

Optional listing-enrichment integrations:

```dotenv
GEMINI_API_KEY=
APIFY_API_TOKEN=
```

Mark `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as both **Build Variable** and runtime variables. All other credentials are runtime-only secrets and must not be exposed as build arguments.

## 4. Prepare Supabase

Apply the required SQL in the Supabase SQL editor before accepting traffic. For an existing database, do not rerun the destructive setup at the beginning of `schema.sql`; apply only migrations or the missing sections, including the **Small Candle Shop** section.

Confirm the following tables exist:

- `listings`
- `subscription_plans`
- `shop_products`
- `shop_orders`
- `shop_order_items`
- `admin_users` if the admin dashboard is used

## 5. Configure Stripe

After the final domain is live:

1. In Stripe Workbench, create a webhook endpoint at `https://YOUR_DOMAIN/api/webhooks/stripe`.
2. Subscribe it to `checkout.session.completed`.
3. Copy the endpoint signing secret into `STRIPE_WEBHOOK_SECRET` in Coolify.
4. Set the live secret key as `STRIPE_SECRET_KEY`.
5. Redeploy after changing the variables.

Use Stripe test credentials first and complete both a listing subscription and candle purchase before switching to live mode.

## 6. Replace the Vercel cron

`vercel.json` is not used on Coolify. If the Supabase keep-alive request is still needed, add a Coolify scheduled task:

- Name: `Supabase keep alive`
- Frequency: `0 0 */3 * *`
- Timeout: `60`
- Command:

```sh
wget --quiet --header="Authorization: Bearer $CRON_SECRET" --output-document=- http://127.0.0.1:3000/api/keep-alive
```

The schedule uses the Hetzner server's configured timezone. Use **Execute Now** once and confirm the output reports success.

## 7. Deploy and verify

Select **Deploy**, then verify:

1. The Docker build finishes successfully.
2. The container becomes healthy.
3. `https://YOUR_DOMAIN/api/health` returns `{"status":"ok"...}`.
4. The home page, `/search`, `/shop`, and `/admin` load.
5. Admin authentication works.
6. A Stripe test checkout returns to the correct domain.
7. The Stripe webhook receives a successful response.

Enable **Auto Deploy** under the application's advanced Git settings if pushes to the production branch should redeploy automatically.

## Operations

- No persistent application storage is required; redeployments may replace the container safely.
- Product artwork is bundled into the image under `public/shop`.
- Database and uploaded listing data remain in Supabase.
- Use Coolify deployment logs for build failures and application logs for runtime failures.
- Roll back from Coolify's deployment history if a new image fails after release.
