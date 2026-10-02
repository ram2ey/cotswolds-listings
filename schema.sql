-- Enable PostGIS spatial extension (required for geography/geometry queries)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID-OSSP extension for gen_random_uuid() or uuid_generate_v4() if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table (CASCADE removes any attached triggers/indexes automatically)
DROP TABLE IF EXISTS listings CASCADE;
DROP TYPE IF EXISTS membership_tier CASCADE;

-- Create custom enum for membership tiers.
CREATE TYPE membership_tier AS ENUM (
  'basic', 
  'claimed',
  'gold', 
  'featured'
);

-- Create listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  google_place_id TEXT UNIQUE,
  description TEXT,
  category TEXT, -- e.g., 'Pub & Restaurant', 'B&B', 'Boutique Hotel', 'Antiques'
  
  -- Contact details
  phone TEXT,
  website TEXT,
  whatsapp TEXT,
  email TEXT,
  
  -- Location handling
  address TEXT,
  postcode TEXT,
  town TEXT NOT NULL, -- Town/village for Cotswolds (e.g. 'Broadway', 'Chipping Campden')
  
  -- Geolocation fields
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geom GEOMETRY(Point, 4326), -- PostGIS Point geometry using standard WGS 84
  
  -- Staging & Tier details
  images TEXT[] DEFAULT '{}'::TEXT[], -- Supabase storage listing-images URLs
  tier membership_tier NOT NULL DEFAULT 'basic', -- Defaulting to 'basic' per global design rules
  stripe_subscription_id TEXT UNIQUE,
  is_approved BOOLEAN NOT NULL DEFAULT false, -- Defaulting to false (hidden from public until verified)
  
  -- Premium Scraped & Review Data
  rating NUMERIC(3, 2),
  reviews_count INTEGER DEFAULT 0,
  opening_hours JSONB,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  premium_metadata JSONB DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for fast search and geographical queries
CREATE INDEX IF NOT EXISTS listings_town_idx ON listings(town);
CREATE INDEX IF NOT EXISTS listings_category_idx ON listings(category);
CREATE INDEX IF NOT EXISTS listings_is_approved_idx ON listings(is_approved);
CREATE INDEX IF NOT EXISTS listings_geom_idx ON listings USING GIST (geom);

-- Trigger function to automatically update the 'geom' column based on latitude & longitude
CREATE OR REPLACE FUNCTION update_listings_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  ELSE
    NEW.geom := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to listings table for geom updates
CREATE TRIGGER trg_update_listings_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON listings
FOR EACH ROW
EXECUTE FUNCTION update_listings_geom();

-- Trigger function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to listings table for updated_at updates
CREATE TRIGGER trg_update_listings_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Database function for high-performance spatial proximity query searches.
-- Converts radius_miles to meters, filters by distance, category, and region,
-- and calculates distances in miles.
CREATE OR REPLACE FUNCTION search_listings_near(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION,
  filter_category TEXT DEFAULT NULL,
  filter_town TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  category TEXT,
  phone TEXT,
  website TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  postcode TEXT,
  town TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[],
  tier membership_tier,
  is_approved BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_miles DOUBLE PRECISION
) AS $$
DECLARE
  -- 1 mile is approximately 1609.34 meters
  radius_meters DOUBLE PRECISION := radius_miles * 1609.34;
  user_geom GEOMETRY(Point, 4326) := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326);
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.slug,
    l.description,
    l.category,
    l.phone,
    l.website,
    l.whatsapp,
    l.email,
    l.address,
    l.postcode,
    l.town,
    l.latitude,
    l.longitude,
    l.images,
    l.tier,
    l.is_approved,
    l.created_at,
    l.updated_at,
    (ST_Distance(l.geom::geography, user_geom::geography) / 1609.34) AS distance_miles
  FROM listings l
  WHERE 
    l.is_approved = true
    AND (radius_miles IS NULL OR ST_DWithin(l.geom::geography, user_geom::geography, radius_meters))
    AND (filter_category IS NULL OR filter_category = '' OR l.category ILIKE '%' || filter_category || '%')
    AND (filter_town IS NULL OR filter_town = '' OR l.town ILIKE '%' || filter_town || '%')
    ORDER BY 
      CASE 
        WHEN l.tier = 'featured' THEN 1
        WHEN l.tier = 'gold' THEN 2
        WHEN l.tier = 'claimed' THEN 3
        ELSE 4
      END ASC,
      distance_miles ASC;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) on listings table to secure direct PostgREST endpoints
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy: Allow anyone (anonymous or authenticated) to read approved listings
CREATE POLICY listings_public_read_policy
ON listings
FOR SELECT
USING (is_approved = true);

-- 2. Anonymous Submission Policy: Allow public to submit new listings 
-- BUT force is_approved = false and tier = 'basic' to restrict direct Gold/Silver overrides
CREATE POLICY listings_anonymous_insert_policy
ON listings
FOR INSERT
WITH CHECK (is_approved = false AND tier = 'basic');

-- Optional: Supabase pg_cron extension snippet to keep database active internally
-- Run the following in Supabase SQL Editor if pg_cron is enabled on your project:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('supabase-keep-alive-job', '0 0 */3 * *', $$ SELECT count(*) FROM listings; $$);

-- ==============================================================================
-- Subscription Plans Table for Dynamic Pricing
-- ==============================================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY, -- e.g. 'claim', 'gold', 'gold_social', 'featured', 'featured_social'
  name TEXT NOT NULL,
  description TEXT,
  price_monthly_gbp NUMERIC(8, 2) NOT NULL,
  features TEXT[] DEFAULT '{}'::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active subscription plans
CREATE POLICY subscription_plans_public_read
ON subscription_plans
FOR SELECT
USING (is_active = true);

-- Seed initial subscription plans
INSERT INTO subscription_plans (id, name, description, price_monthly_gbp, features, is_active)
VALUES
  ('claim', 'Claim Listing', 'Verify ownership, link your website, and display reviews.', 20.00, ARRAY['✓ Verify Ownership', '✓ Link Official Website', '✓ Rating Stars & Reviews'], true),
  ('gold', 'Gold Partner', 'The complete premium listing experience.', 50.00, ARRAY['✓ Gold Partner Badge', '✓ Priority Search Ranking', '✓ Full Photo Gallery', '✓ AI-Generated Details'], true),
  ('gold_social', 'Gold & Social Package', 'All Gold features + dedicated social media promotion.', 150.00, ARRAY['✓ Gold Partner Badge', '✓ Priority Search Ranking', '✓ Social Media Promotion', '✓ AI-Generated Details'], true),
  ('featured', 'Featured Partner', 'Absolute maximum visibility across Cotswolds Pages.', 100.00, ARRAY['✓ Featured Standout Badge', '✓ Absolute Top Ranking', '✓ Full Photo Gallery', '✓ AI-Generated Details'], true),
  ('featured_social', 'Featured & Social Promotion', 'Absolute max visibility + premium campaigns.', 200.00, ARRAY['✓ Featured Standout Badge', '✓ Absolute Top Ranking', '✓ Premium Social Campaigns', '✓ AI-Generated Details'], true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- Small Candle Shop
-- ==============================================================================
CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  eyebrow TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Candles',
  description TEXT NOT NULL DEFAULT '',
  price_gbp NUMERIC(8, 2) NOT NULL CHECK (price_gbp >= 0),
  original_price_gbp NUMERIC(8, 2) NOT NULL DEFAULT 49.99,
  image_url TEXT NOT NULL,
  fragrance_family TEXT NOT NULL DEFAULT '',
  top_notes TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  heart_notes TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  base_notes TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  burn_time TEXT NOT NULL DEFAULT '',
  size_grams INTEGER NOT NULL CHECK (size_grams > 0),
  adorned_with TEXT NOT NULL DEFAULT '',
  scent_mood TEXT NOT NULL DEFAULT '',
  fragrance_options TEXT[] DEFAULT '{}'::TEXT[],
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'paid',
  amount_total_pence INTEGER NOT NULL CHECK (amount_total_pence >= 0),
  currency TEXT NOT NULL DEFAULT 'gbp',
  customer_email TEXT,
  customer_name TEXT,
  shipping_address JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shop_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES shop_products(id),
  fragrance TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL,
  unit_price_pence INTEGER NOT NULL CHECK (unit_price_pence >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  UNIQUE (order_id, product_id, fragrance)
);

CREATE INDEX IF NOT EXISTS shop_products_active_order_idx ON shop_products(is_active, display_order);
CREATE INDEX IF NOT EXISTS shop_orders_created_idx ON shop_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS shop_order_items_order_idx ON shop_order_items(order_id);

ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY shop_products_public_read
ON shop_products FOR SELECT
USING (is_active = true);

INSERT INTO shop_products (
  id, slug, name, eyebrow, category, description, price_gbp, original_price_gbp, image_url, fragrance_family,
  top_notes, heart_notes, base_notes, burn_time, size_grams, adorned_with, scent_mood, fragrance_options,
  stock_quantity, is_featured, is_active, display_order
)
VALUES
  ('d1000001-0000-4000-8000-000000000001', 'floral-musk', 'Floral Musk', 'Serene & Luxurious', 'Candles', 'A musky, smooth, and balanced aroma with cool florals and creamy undertones.', 39.99, 49.99, '/shop/floral-musk.jpg', 'Floral & Musk', ARRAY['Lily', 'Peony'], ARRAY['Rose', 'Jasmine'], ARRAY['Carnation', 'Creamy Musk'], '35–40 hours', 225, 'Natural chip stones, dried flowers, and petals', 'Musky, smooth, and balanced, with a creamy, harmonious aroma', '{}'::TEXT[], 18, true, true, 1),
  ('d1000001-0000-4000-8000-000000000002', 'morning-dew', 'Morning Dew', 'Fresh & Grounding', 'Candles', 'Light, airy, and rejuvenating with fresh eucalyptus, geranium, and mint that lifts the senses.', 39.99, 49.99, '/shop/morning-dew.jpg', 'Fresh & Herbal', ARRAY['Fresh Eucalyptus', 'Crisp Mint'], ARRAY['Floral Geranium', 'Lemongrass'], ARRAY['Green Aventurine Energy', 'Crisp Herb Leaf'], '35–40 hours', 225, 'Dried flowers, lemongrass, and green aventurine stones for grounding and healing energy', 'Light, airy, and rejuvenating, with a serene freshness that lifts the senses', '{}'::TEXT[], 20, true, true, 2),
  ('d1000001-0000-4000-8000-000000000003', 'sweet-memories', 'Sweet Memories', 'Bright & Uplifting', 'Candles', 'A lively blend of juicy fruits with subtle rustic undertones and sweet, playful highlights.', 39.99, 49.99, '/shop/sweet-memories.jpg', 'Fruity & Sweet', ARRAY['Juicy Orchard Fruits', 'Summer Berries'], ARRAY['Subtle Rustic Undertones', 'Sweet Florals'], ARRAY['Golden Sugar', 'Warm Vanilla'], '35–40 hours', 225, 'Pink rhodonite for emotional healing, compassion, and nurturing energy', 'Bright, uplifting, and invigorating — radiates joy and creates a cheerful, sunny, and lively ambiance', '{}'::TEXT[], 22, true, true, 3),
  ('d1000001-0000-4000-8000-000000000004', 'sunset', 'Sunset', 'Citrus & Creative Energy', 'Candles', 'Fresh and citrussy with juicy peach, zesty orange, and tart cranberry over frosty ice.', 39.99, 49.99, '/shop/sunset.jpg', 'Citrus & Fruity', ARRAY['Juicy Peach', 'Zesty Orange'], ARRAY['Tart Cranberry', 'Frosty Ice Accord'], ARRAY['Orange Blossom', 'Solar Warmth'], '35–40 hours', 225, 'Dried botanicals and natural orange carnelian stones to boost energy and creativity', 'Fresh and citrussy, with a bright, uplifting character that revitalises the space', '{}'::TEXT[], 16, true, true, 4),
  ('d1000001-0000-4000-8000-000000000005', 'moonlight', 'Moonlight', 'Calm & Tranquil', 'Candles', 'Calm, refreshing, and gently warm with powdery florals, sweet orange, green leaf, and soothing chamomile.', 39.99, 49.99, '/shop/moonlight.jpg', 'Floral & Calming', ARRAY['Sweet Orange', 'Green Leaf'], ARRAY['Soothing Chamomile', 'Powdery Florals'], ARRAY['Gentle Warmth', 'Soft Petals'], '35–40 hours', 225, 'Dried flower petals and natural amethyst stones to promote balance and tranquility', 'Calm, refreshing, and gently warm — promoting balance and tranquility', '{}'::TEXT[], 15, true, true, 5),
  ('d1000001-0000-4000-8000-000000000006', 'sparkle', 'Sparkle', 'Sweet & Playful', 'Candles', 'Sweet, playful, and wonderfully indulgent with notes of bubblegum, ripe banana, juicy pear drops, and warm musk.', 39.99, 49.99, '/shop/sparkle.jpg', 'Sweet & Gourmand', ARRAY['Bubblegum', 'Juicy Pear Drops'], ARRAY['Ripe Banana', 'Sugary Candyfloss'], ARRAY['Warm Musk', 'Creamy Vanilla'], '35–40 hours', 225, 'Natural rose quartz stones to promote love, compassion, and emotional healing', 'Sweet, playful, and indulgent — fun and uplifting', '{}'::TEXT[], 14, false, true, 6),
  ('d1000001-0000-4000-8000-000000000007', 'honey-dusk', 'Honey Dusk', 'Warm & Opulent', 'Candles', 'Warm, opulent, smoky and woody with dark honey, spices, sandalwood, amber, tonka beans, and patchouli.', 39.99, 49.99, '/shop/honey-dusk.jpg', 'Woody & Amber', ARRAY['Dark Honey', 'Warm Spices'], ARRAY['Sandalwood', 'Tonka Beans'], ARRAY['Golden Amber', 'Smoky Patchouli'], '35–40 hours', 225, 'Natural red agate stones to promote courage, strength, and grounding', 'Warm, opulent, smoky and woody — ideal for a cosy evening filled with warmth and comfort', '{}'::TEXT[], 16, true, true, 7),
  ('d1000001-0000-4000-8000-000000000008', 'lemongrass', 'Lemongrass', 'Refreshing & Vibrant', 'Candles', 'Crisp, citrusy lemongrass that enlivens your space with vibrant energy.', 39.99, 49.99, '/shop/lemongrass.jpg', 'Citrus & Herbal', ARRAY['Crisp Lemongrass', 'Fresh Citron'], ARRAY['Aromatic Botanicals', 'Crushed Citrus Leaves'], ARRAY['Clean Woody Herbal Finish'], '35–40 hours', 225, 'Natural blue-green amazonite stones to promote hope and prosperity', 'Refreshing, citrusy, and vibrant — energizing and perfect for enhancing focus', '{}'::TEXT[], 19, false, true, 8),
  ('d1000001-0000-4000-8000-000000000009', 'rainbow', 'Rainbow', 'Bright & Fruity Warmth', 'Candles', 'Bright, fruity, and vibrant with zesty orange, grapefruit, dark cassis, and juicy red berries wrapped in cozy warmth.', 39.99, 49.99, '/shop/rainbow.jpg', 'Fruity & Citrus', ARRAY['Zesty Orange', 'Pink Grapefruit'], ARRAY['Dark Cassis', 'Juicy Red Berries'], ARRAY['Cozy Warm Undertones', 'Soft Amber'], '35–40 hours', 225, 'Natural chip stones', 'Bright, fruity, and vibrant, with a cozy warmth that feels uplifting and comforting', '{}'::TEXT[], 15, false, true, 9),
  ('d1000001-0000-4000-8000-000000000010', 'discovery-set', 'The Lana Lotus Discovery Set', '9 Unique Fragrances · Wax Melts', 'Wax Melts', 'A curated set of 9 scented, plant-based wax melts in 9 unique fragrances, each individually packed.', 39.99, 49.99, '/shop/discovery-set.jpg', 'Discovery Collection', ARRAY['Sunset', 'Moonlight', 'Sparkle'], ARRAY['Lemongrass', 'Honey Dusk', 'Sweet Memories'], ARRAY['Morning Dew', 'Floral Musk', 'Rainbow'], 'Up to 90 hours total fragrance', 180, 'Matte black presentation gift box with Lana Lotus Craft seal', 'A complete journey through all 9 signature Lana Lotus fragrances', '{}'::TEXT[], 25, true, true, 10),
  ('d1000001-0000-4000-8000-000000000011', 'scented-wax-sachets', 'Scented Wax Sachets (Set of 4)', 'Wardrobe & Drawer Fragrance', 'Wax Sachets', 'An elegant set of 4 plant-based wax sachets in your choice of fragrance, decorated with real pressed flowers and crystals.', 39.99, 49.99, '/shop/wax-sachets.jpg', 'Botanical & Home', ARRAY['Choose from 6 signature aromas'], ARRAY['Real Pressed Flowers', 'Dried Botanicals'], ARRAY['Natural Crystals', 'Plant-Based Soy Wax'], 'Scents spaces for 3–6 months', 120, 'Handmade botanical embeds, natural stones, and hanging cords', 'Delicate continuous aroma for closets, dressers, linen cupboards, and powder rooms', ARRAY['Sunset', 'Moonlight', 'Honey Dusk', 'Sweet Memories', 'Morning Dew', 'Floral Musk'], 20, true, true, 11)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  eyebrow = EXCLUDED.eyebrow,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  price_gbp = EXCLUDED.price_gbp,
  original_price_gbp = EXCLUDED.original_price_gbp,
  image_url = EXCLUDED.image_url,
  fragrance_family = EXCLUDED.fragrance_family,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes,
  burn_time = EXCLUDED.burn_time,
  size_grams = EXCLUDED.size_grams,
  adorned_with = EXCLUDED.adorned_with,
  scent_mood = EXCLUDED.scent_mood,
  fragrance_options = EXCLUDED.fragrance_options,
  stock_quantity = EXCLUDED.stock_quantity,
  is_featured = EXCLUDED.is_featured,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;



