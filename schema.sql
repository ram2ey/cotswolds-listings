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
      ELSE 3
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
