-- Apply to an existing Supabase database before enabling Stripe checkout.
-- Creates missing shop tables and seeds the catalogue without replacing existing products.
ALTER TABLE listings ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS listings_stripe_subscription_id_idx
  ON listings (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;


-- Create missing shop tables and seed only products that do not already exist.
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
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS shop_products_active_order_idx ON shop_products(is_active, display_order);
CREATE INDEX IF NOT EXISTS shop_orders_created_idx ON shop_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS shop_order_items_order_idx ON shop_order_items(order_id);

ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'shop_products'
      AND policyname = 'shop_products_public_read'
  ) THEN
    CREATE POLICY shop_products_public_read
      ON shop_products FOR SELECT USING (is_active = true);
  END IF;
END $$;

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
ON CONFLICT (id) DO NOTHING;

-- Upgrade existing shop order items to support fragrance variants.
ALTER TABLE shop_order_items ADD COLUMN IF NOT EXISTS fragrance TEXT NOT NULL DEFAULT '';
ALTER TABLE shop_order_items DROP CONSTRAINT IF EXISTS shop_order_items_order_id_product_id_key;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shop_order_items_order_product_fragrance_key'
  ) THEN
    ALTER TABLE shop_order_items ADD CONSTRAINT shop_order_items_order_product_fragrance_key
      UNIQUE (order_id, product_id, fragrance);
  END IF;
END $$;
