import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Haversine formula helper to compute distance in miles (used for mock data fallback)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Curated list of mock data for robust offline development when keys are not configured
function getMockListings(
  category: string | null,
  region: string | null,
  lat: number | null,
  lng: number | null,
  radius: number | null
) {
  const mockData = [
    {
      id: "mock-1",
      title: "Cotswolds Builders Ltd",
      slug: "cotswolds-builders-ltd-broadway",
      description: "Professional building contractors offering home extensions, carpentry, and building services in Broadway.",
      category: "Construction & Home Maintenance",
      phone: "+44 1386 852255",
      website: "https://www.cotswoldbuilders.example.com",
      whatsapp: null,
      email: "info@cotswoldbuilders.example.com",
      address: "High St, Broadway",
      postcode: "WR12 7DU",
      town: "Broadway",
      latitude: 52.0366,
      longitude: -1.8558,
      images: ["/construction-maintenance.jpg"],
      tier: "gold",
      is_approved: true,
      distance_miles: lat && lng ? calculateDistance(lat, lng, 52.0366, -1.8558) : undefined
    },
    {
      id: "mock-2",
      title: "Cotswold Tea Room",
      slug: "cotswold-tea-room-kingham",
      description: "Traditional tea room serving home-baked cakes, fresh loose-leaf tea, and light lunches.",
      category: "Restaurants & Cafés",
      phone: "+44 1608 658389",
      website: "https://cotswoldtearoom.example.com",
      whatsapp: null,
      email: "welcome@cotswoldtearoom.example.com",
      address: "Church St, Kingham",
      postcode: "OX7 6YA",
      town: "Kingham",
      latitude: 51.9083,
      longitude: -1.6146,
      images: ["https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80"],
      tier: "silver",
      is_approved: true,
      distance_miles: lat && lng ? calculateDistance(lat, lng, 51.9083, -1.6146) : undefined
    },
    {
      id: "mock-3",
      title: "Broadway Hotel & Suites",
      slug: "broadway-hotel-suites-broadway",
      description: "Clean boutique hotel offering quality suites, beautiful gardens, and great hospitality in Stow-on-the-Wold.",
      category: "Hotels & Motels",
      phone: "+44 1451 870048",
      website: "https://broadwayhotelsuites.example.com",
      whatsapp: null,
      email: "info@broadwayhotelsuites.example.com",
      address: "Digbeth St, Stow-on-the-Wold",
      postcode: "GL54 1BN",
      town: "Stow-on-the-Wold",
      latitude: 51.9298,
      longitude: -1.7247,
      images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"],
      tier: "basic",
      is_approved: true,
      distance_miles: lat && lng ? calculateDistance(lat, lng, 51.9298, -1.7247) : undefined
    }
  ];

  // Filter listings based on user filters
  return mockData.filter((listing) => {
    if (category && !listing.category.toLowerCase().includes(category.toLowerCase())) {
      return false;
    }
    if (
      region &&
      !listing.town.toLowerCase().includes(region.toLowerCase())
    ) {
      return false;
    }
    if (lat && lng && radius) {
      if (listing.distance_miles !== undefined && listing.distance_miles > radius) {
        return false;
      }
    }
    return true;
  });
}

// Fallback querying using Supabase table select if database function is missing
async function fallbackTableQuery(supabase: any, category: string | null, town: string | null) {
  let query = supabase
    .from('listings')
    .select('*')
    .eq('is_approved', true);

  if (category) {
    query = query.ilike('category', `%${category}%`);
  }

  if (town) {
    query = query.ilike('town', `%${town}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const town = searchParams.get('town') || searchParams.get('region');
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius');

    const lat = latStr ? parseFloat(latStr) : null;
    const lng = lngStr ? parseFloat(lngStr) : null;
    const radius = radiusStr ? parseFloat(radiusStr) : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Use mock data if keys are unconfigured or pointing to placeholders
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-url-here')) {
      const mockResult = getMockListings(category, town, lat, lng, radius);
      
      // Sort results (gold -> silver -> basic)
      const tierOrder: Record<string, number> = { gold: 1, silver: 2, basic: 3 };
      mockResult.sort((a, b) => {
        const tierA = tierOrder[a.tier] || 99;
        const tierB = tierOrder[b.tier] || 99;
        if (tierA !== tierB) return tierA - tierB;
        if (a.distance_miles !== undefined && b.distance_miles !== undefined) {
          return a.distance_miles - b.distance_miles;
        }
        return a.title.localeCompare(b.title);
      });
      
      return NextResponse.json(mockResult);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let listings = [];

    // Check if coordinates were passed to execute a spatial radius constraint
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      console.log(`Executing PostGIS proximity query for user coordinates: (${lat}, ${lng}) with radius: ${radius || 10} miles`);
      const { data, error } = await supabase.rpc('search_listings_near', {
        user_lat: lat,
        user_lng: lng,
        radius_miles: radius || 10.0,
        filter_category: category || null,
        filter_town: town || null
      });

      if (error) {
        console.warn('Supabase RPC search_listings_near failed (falling back to standard query):', error.message);
        listings = await fallbackTableQuery(supabase, category, town);
        // Manual distance attachment for standard results
        listings = listings.map((l: any) => ({
          ...l,
          distance_miles: l.latitude && l.longitude ? calculateDistance(lat, lng, l.latitude, l.longitude) : undefined
        }));
      } else {
        listings = data || [];
      }
    } else {
      // Normal text-based query without spatial search
      listings = await fallbackTableQuery(supabase, category, town);
    }

    // Explicit sorting: bubble 'gold' listings to the top, then 'silver', then 'basic'.
    // If distance is present, sort by distance within each tier.
    const tierOrder: Record<string, number> = { gold: 1, silver: 2, basic: 3 };
    listings.sort((a: any, b: any) => {
      const tierA = tierOrder[a.tier] || 99;
      const tierB = tierOrder[b.tier] || 99;
      if (tierA !== tierB) {
        return tierA - tierB;
      }
      if (a.distance_miles !== undefined && b.distance_miles !== undefined) {
        return a.distance_miles - b.distance_miles;
      }
      return a.title.localeCompare(b.title);
    });

    return NextResponse.json(listings);
  } catch (err: any) {
    console.error('Error in API listings endpoint:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const {
      title,
      description,
      category,
      phone,
      website,
      email,
      whatsapp,
      address,
      postcode,
      town,
      latitude,
      longitude,
      imageBase64,
      imageType
    } = payload;

    if (!title || !town) {
      return NextResponse.json({ error: 'Missing required fields (Title, Town/Village)' }, { status: 400 });
    }

    // Generate slug using title and town
    const slug = (title + '-' + town)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let imageUrls: string[] = [];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('your-supabase-url-here')) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      if (imageBase64) {
        const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const contentType = imageType || 'image/jpeg';
        const extension = contentType.split('/')[1] || 'jpg';
        const filePath = `submissions/${slug}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, buffer, {
            contentType,
            upsert: true
          });

        if (uploadError) {
          console.error("Storage upload error during submission:", uploadError.message);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('listing-images')
            .getPublicUrl(filePath);
          imageUrls.push(publicUrl);
        }
      }

      // Explicitly enforce tier='basic' and is_approved=false
      const { error: dbError } = await supabase
        .from('listings')
        .insert({
          title,
          slug,
          description: description || '',
          category: category || 'Local Business',
          phone: phone || null,
          website: website || null,
          email: email || null,
          whatsapp: whatsapp || null,
          address: address || '',
          postcode: postcode || '',
          town,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          images: imageUrls,
          tier: 'basic',
          is_approved: false
        });

      if (dbError) {
        throw new Error(dbError.message);
      }
    } else {
      console.log("Mock Submit: Submitting listing", { title, slug, is_approved: false, tier: 'basic' });
    }

    return NextResponse.json({ success: true, slug });
  } catch (err: any) {
    console.error("Submission API Error:", err.message);
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}
