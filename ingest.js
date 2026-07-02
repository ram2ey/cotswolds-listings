require('dotenv').config({ path: '.env.local' });
const { ApifyClient } = require('apify-client');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Supabase URL or Service Role Key is missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Help function to generate clean URL-friendly slug based on title and village/sub-region
function generateSlug(title, village) {
  const parts = [title, village].filter(Boolean).join('-');
  return parts
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove non-alphanumeric/spaces/hyphens
    .replace(/[\s_-]+/g, '-')     // Replace spaces/underscores with a single hyphen
    .replace(/^-+|-+$/g, '');     // Trim leading/trailing hyphens
}

// Help function to detect county based on address text
function detectCounty(address = '', city = '') {
  const fullText = (address + ' ' + city).toLowerCase();
  if (fullText.includes('oxford') || fullText.includes('burford') || fullText.includes('chipping norton') || fullText.includes('woodstock')) {
    return 'Oxfordshire';
  }
  if (fullText.includes('warwick') || fullText.includes('stratford') || fullText.includes('shipston')) {
    return 'Warwickshire';
  }
  if (fullText.includes('wilt') || fullText.includes('castle combe') || fullText.includes('chippenham')) {
    return 'Wiltshire';
  }
  if (fullText.includes('worcester') || fullText.includes('broadway')) {
    return 'Worcestershire';
  }
  // Default to Gloucestershire (which covers the majority of the Cotswolds area)
  return 'Gloucestershire';
}

// Help function to standardize raw Google Maps categories to match frontend dropdown filters
function mapCategory(rawCategory = '') {
  const cat = rawCategory.toLowerCase();
  
  if (cat.includes('hotel') || cat.includes('accommodation') || cat.includes('bed & breakfast') || cat.includes('bed and breakfast') || cat.includes('b&b') || cat.includes('guesthouse') || cat.includes('lodging') || cat.includes('hostel')) {
    return 'Hotel & Accommodation';
  }
  if (cat.includes('gastropub') || cat.includes('inn')) {
    return 'Gastropub & Inn';
  }
  if (cat.includes('pub') || cat.includes('bar') || cat.includes('restaurant') || cat.includes('cafe') || cat.includes('coffee') || cat.includes('bakery') || cat.includes('tea room') || cat.includes('diner') || cat.includes('grill') || cat.includes('steakhouse') || cat.includes('bistro')) {
    return 'Pub & Restaurant';
  }
  if (cat.includes('shop') || cat.includes('store') || cat.includes('boutique') || cat.includes('gallery') || cat.includes('antique') || cat.includes('market') || cat.includes('florist') || cat.includes('bookstore')) {
    return 'Boutique Shop';
  }
  if (cat.includes('attraction') || cat.includes('tour') || cat.includes('museum') || cat.includes('garden') || cat.includes('landmark') || cat.includes('park') || cat.includes('castle') || cat.includes('riding') || cat.includes('nature') || cat.includes('activity')) {
    return 'Attraction & Tour';
  }
  return 'Local Business';
}

// Download image binary as Buffer
async function downloadImage(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
    const buffer = Buffer.from(response.data, 'binary');
    const contentType = response.headers['content-type'] || 'image/jpeg';
    return { buffer, contentType };
  } catch (error) {
    console.error(`Warning: Failed to download image from ${url} (${error.message})`);
    return null;
  }
}

// Stream image buffer to Supabase storage bucket
async function uploadToSupabaseStorage(slug, imageSrc, idx = 0) {
  try {
    const downloadResult = await downloadImage(imageSrc);
    if (!downloadResult) return null;

    const { buffer, contentType } = downloadResult;
    const extension = contentType.split('/')[1] || 'jpg';
    const filePath = idx === 0
      ? `listings/${slug}.${extension}`
      : `listings/${slug}-${idx}.${extension}`;

    console.log(`Streaming image (index ${idx}) for '${slug}' into listing-images bucket: ${filePath}...`);
    
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(filePath, buffer, {
        contentType,
        upsert: true // Allow overwrites
      });

    if (error) {
      console.error(`Error uploading storage object (index ${idx}) for ${slug}:`, error.message);
      return null;
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error(`Error in uploadToSupabaseStorage for ${slug} at index ${idx}:`, error.message);
    return null;
  }
}

// Main Ingestion Workflow
async function runIngestion() {
  console.log('--- STARTING INGESTION DATA-PIPELINE ---');
  let rawItems = [];

  const apifyToken = process.env.APIFY_API_TOKEN;
  if (apifyToken && apifyToken !== 'your-apify-api-token-here') {
    console.log('Apify Token detected. Connecting to Apify API...');
    const client = new ApifyClient({ token: apifyToken });

    // Configure the Google Maps Scraper Actor
    const input = {
      searchStringsArray: [
        // --- HOTELS & ACCOMMODATION ---
        "boutique hotels Chipping Campden Cotswolds",
        "historic hotels Broadway Cotswolds",
        "luxury hotels Burford Cotswolds",
        "country house hotels Stow-on-the-Wold",
        "hotels Bourton-on-the-Water Cotswolds",
        "B&B bed and breakfast Cheltenham Cotswolds",
        "boutique hotels Cirencester Cotswolds",
        "hotels Moreton-in-Marsh Cotswolds",
        "hotels Chipping Norton Oxfordshire Cotswolds",
        "inns and hotels Tetbury Gloucestershire",
        
        // --- PUBS & GASTRO PUBS ---
        "traditional pubs Bourton-on-the-Water Cotswolds",
        "gastropubs Broadway Worcestershire Cotswolds",
        "village pubs Chipping Campden Cotswolds",
        "country pubs Stow-on-the-Wold Gloucestershire",
        "pubs Burford Oxfordshire Cotswolds",
        "gastro pubs Cirencester Gloucestershire",
        "best pubs Moreton-in-Marsh Cotswolds",
        "historic coaching inns Cotswolds",
        
        // --- RESTAURANTS & DINING ---
        "restaurants Chipping Campden Cotswolds",
        "fine dining restaurants Cheltenham Cotswolds",
        "restaurants Burford Oxfordshire",
        "tea rooms Bourton-on-the-Water Cotswolds",
        "restaurants Broadway Cotswolds",
        "restaurants Stow-on-the-Wold Gloucestershire",
        "restaurants Cirencester Gloucestershire",
        
        // --- CAFES & BAKERIES ---
        "cafes and coffee shops Cotswolds",
        "bakeries and tea rooms Chipping Campden",
        "cafes Bourton-on-the-Water",
        
        // --- SHOPS & RETAIL ---
        "antique shops Stow-on-the-Wold Cotswolds",
        "art galleries Chipping Campden Cotswolds",
        "independent shops Burford Oxfordshire",
        "gift shops Bourton-on-the-Water Cotswolds",
        "farm shops Cotswolds Gloucestershire",
        
        // --- SPAS & WELLNESS ---
        "spas and wellness retreats Cotswolds",
        "day spas Cheltenham Cotswolds",
        
        // --- WEDDING VENUES ---
        "wedding venues Cotswolds Gloucestershire",
        "barn wedding venues Cotswolds",
        
        // --- ATTRACTIONS & ACTIVITIES ---
        "visitor attractions Cotswolds UK",
        "gardens and National Trust Cotswolds",
        "horse riding Cotswolds Gloucestershire",
        "walking tours Cotswolds"
      ],
      maxCrawledPlacesPerSearch: 10,
      language: "en",
      extractImages: false
    };

    try {
      console.log('Running Apify Google Maps Scraper actor (compass/crawler-google-places)...');
      const run = await client.actor("compass/crawler-google-places").call(input);
      console.log(`Scraper finished. Fetching dataset items (Run ID: ${run.id})...`);
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      rawItems = items;
      console.log(`Retrieved ${rawItems.length} items from Apify.`);
    } catch (err) {
      console.error('Failed to run Apify actor. Falling back to Mock Ingestion. Error:', err.message);
    }
  }

  // Fallback to high-quality Mock data if no items were fetched or Apify client is not configured
  if (rawItems.length === 0) {
    console.log('No Apify data. Using high-quality mock Cotswolds listings for ingestion testing...');
    rawItems = [
      {
        title: "The Lygon Arms",
        subTitle: "Historic Inn & Hotel",
        phone: "+44 1386 852255",
        website: "https://www.lygonarmshotel.co.uk",
        address: "High St, Broadway, Worcestershire WR12 7DU",
        city: "Broadway",
        postalCode: "WR12 7DU",
        location: { lat: 52.0366, lng: -1.8558 },
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        imageUrls: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1582719478250-c89cae4db85b?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"
        ],
        totalScore: 4.8,
        reviewsCount: 245,
        placeId: "google-place-lygon-arms",
        openingHours: [
          { "day": "Monday", "hours": "Open 24 hours" },
          { "day": "Tuesday", "hours": "Open 24 hours" },
          { "day": "Wednesday", "hours": "Open 24 hours" },
          { "day": "Thursday", "hours": "Open 24 hours" },
          { "day": "Friday", "hours": "Open 24 hours" },
          { "day": "Saturday", "hours": "Open 24 hours" },
          { "day": "Sunday", "hours": "Open 24 hours" }
        ]
      },
      {
        title: "The Wild Rabbit",
        subTitle: "Gastropub & Inn",
        phone: "+44 1608 658389",
        website: "https://thewildrabbit.co.uk",
        address: "Church St, Kingham, Chipping Norton, Oxfordshire OX7 6YA",
        city: "Kingham",
        postalCode: "OX7 6YA",
        location: { lat: 51.9083, lng: -1.6146 },
        imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
        imageUrls: [
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
        ],
        totalScore: 4.7,
        reviewsCount: 198,
        placeId: "google-place-wild-rabbit",
        openingHours: [
          { "day": "Monday", "hours": "12:00 PM - 11:00 PM" },
          { "day": "Tuesday", "hours": "12:00 PM - 11:00 PM" },
          { "day": "Wednesday", "hours": "12:00 PM - 11:00 PM" },
          { "day": "Thursday", "hours": "12:00 PM - 11:00 PM" },
          { "day": "Friday", "hours": "12:00 PM - 11:00 PM" },
          { "day": "Saturday", "hours": "12:00 PM - 11:00 PM" },
          { "day": "Sunday", "hours": "12:00 PM - 10:30 PM" }
        ]
      },
      {
        title: "The Porch House",
        subTitle: "Traditional Pub & Restaurant",
        phone: "+44 1451 870048",
        website: "https://www.porch-house.co.uk",
        address: "Digbeth St, Stow-on-the-Wold, Gloucestershire GL54 1BN",
        city: "Stow-on-the-Wold",
        postalCode: "GL54 1BN",
        location: { lat: 51.9298, lng: -1.7247 },
        imageUrl: "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=800&q=80",
        imageUrls: [
          "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
        ],
        totalScore: 4.5,
        reviewsCount: 167,
        placeId: "google-place-porch-house",
        openingHours: [
          { "day": "Monday", "hours": "11:00 AM - 11:00 PM" },
          { "day": "Tuesday", "hours": "11:00 AM - 11:00 PM" },
          { "day": "Wednesday", "hours": "11:00 AM - 11:00 PM" },
          { "day": "Thursday", "hours": "11:00 AM - 11:00 PM" },
          { "day": "Friday", "hours": "11:00 AM - 11:00 PM" },
          { "day": "Saturday", "hours": "11:00 AM - 11:00 PM" },
          { "day": "Sunday", "hours": "11:00 AM - 10:30 PM" }
        ]
      }
    ];
  }

  const upsertListings = [];

  for (const item of rawItems) {
    const title = item.title || item.name;
    
    // Skip permanently closed locations
    if (item.isClosed || item.permanentlyClosed || item.closed === true) {
      console.log(`Skipping permanently closed business: "${title}"`);
      continue;
    }

    const lat = item.location ? parseFloat(item.location.lat) : null;
    const lng = item.location ? parseFloat(item.location.lng) : null;

    // Geographic bounding box validation (Cotswolds coordinates filter)
    if (lat !== null && lng !== null) {
      const isInsideCotswolds = (lat >= 51.35 && lat <= 52.25) && (lng >= -2.45 && lng <= -1.3);
      if (!isInsideCotswolds) {
        console.log(`Skipping out-of-bounds business: "${title}" (${lat}, ${lng})`);
        continue;
      }
    }

    const village = item.city || item.sub_region || 'cotswolds';
    const slug = generateSlug(title, village);
    
    console.log(`Processing listing: "${title}" (Slug: ${slug})...`);

    // Handle Image Streaming (Fetch up to 4 images for premium display)
    let imageUrls = [];
    const rawImageUrls = [];
    if (item.imageUrl) rawImageUrls.push(item.imageUrl);
    if (item.imageUrls && Array.isArray(item.imageUrls)) {
      item.imageUrls.forEach(url => {
        if (url && !rawImageUrls.includes(url)) {
          rawImageUrls.push(url);
        }
      });
    }

    const targetImages = rawImageUrls.slice(0, 1);
    for (let i = 0; i < targetImages.length; i++) {
      const storedUrl = await uploadToSupabaseStorage(slug, targetImages[i], i);
      if (storedUrl) {
        imageUrls.push(storedUrl);
      }
    }

    // Determine Cotswolds County
    const county = detectCounty(item.address, item.city);

    // Build database mapping
    const dbListing = {
      title: title,
      slug: slug,
      description: item.subTitle || item.description || `Beautiful local listing in ${village}, Cotswolds.`,
      category: mapCategory(item.categoryName || item.subTitle || 'Local Business'),
      phone: item.phone || item.phoneNormalized || null,
      website: item.website || null,
      whatsapp: item.whatsapp || null,
      address: item.address || '',
      postcode: item.postalCode || item.zip || '',
      county: county,
      sub_region: village,
      latitude: lat,
      longitude: lng,
      images: imageUrls,
      
      // Seed ratings & hours directly from scraped Google Maps dataset fields
      rating: item.totalScore || null,
      reviews_count: item.reviewsCount || null,
      opening_hours: item.openingHours || null,
      google_place_id: item.placeId || null,

      // Ingest live immediately (bypass admin staging queue)
      tier: 'basic',
      is_approved: true
    };

    upsertListings.push(dbListing);
  }

  if (upsertListings.length > 0) {
    const BATCH_SIZE = 50;
    let totalUpserted = 0;
    let hasError = false;

    for (let i = 0; i < upsertListings.length; i += BATCH_SIZE) {
      const batch = upsertListings.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(upsertListings.length / BATCH_SIZE);
      console.log(`Upserting batch ${batchNum}/${totalBatches} (${batch.length} listings)...`);

      const { error } = await supabase
        .from('listings')
        .upsert(batch, { onConflict: 'slug' });

      if (error) {
        console.error(`Batch ${batchNum} upsert error:`, error.message);
        hasError = true;
      } else {
        totalUpserted += batch.length;
      }
    }

    if (!hasError) {
      console.log('--- INGESTION WORKFLOW COMPLETED SUCCESSFULLY ---');
      console.log(`Total listings upserted: ${totalUpserted}`);
    } else {
      console.log(`Partial completion: ${totalUpserted}/${upsertListings.length} listings upserted.`);
    }
  }
}

// Execute Ingestion Pipeline
runIngestion().catch(console.error);
