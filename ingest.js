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
async function uploadToSupabaseStorage(slug, imageSrc) {
  try {
    const downloadResult = await downloadImage(imageSrc);
    if (!downloadResult) return null;

    const { buffer, contentType } = downloadResult;
    const extension = contentType.split('/')[1] || 'jpg';
    const filePath = `listings/${slug}.${extension}`;

    console.log(`Streaming image for '${slug}' into listing-images bucket: ${filePath}...`);
    
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(filePath, buffer, {
        contentType,
        upsert: true // Allow overwrites
      });

    if (error) {
      console.error(`Error uploading storage object for ${slug}:`, error.message);
      return null;
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error(`Error in uploadToSupabaseStorage for ${slug}:`, error.message);
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
        "historic hotels in Cotswolds UK",
        "traditional pubs in Bourton-on-the-Water, Cotswolds"
      ],
      maxCrawledPlacesPerSearch: 3, // Safe limit for test running
      language: "en"
    };

    try {
      console.log('Running Apify Google Maps Scraper actor (apify/google-maps-scraper)...');
      const run = await client.actor("apify/google-maps-scraper").call(input);
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
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
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
        imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
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
        imageUrl: "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=800&q=80"
      }
    ];
  }

  const upsertListings = [];

  for (const item of rawItems) {
    const title = item.title || item.name;
    const village = item.city || item.sub_region || 'cotswolds';
    const slug = generateSlug(title, village);
    
    console.log(`Processing listing: "${title}" (Slug: ${slug})...`);

    // Handle Image Streaming Integrity (No external hotlinking)
    let imageUrls = [];
    const externalImage = item.imageUrl || (item.imageUrls && item.imageUrls[0]);

    if (externalImage) {
      const storedUrl = await uploadToSupabaseStorage(slug, externalImage);
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
      category: item.categoryName || item.subTitle || 'Local Business',
      phone: item.phone || item.phoneNormalized || null,
      website: item.website || null,
      whatsapp: item.whatsapp || null,
      address: item.address || '',
      postcode: item.postalCode || item.zip || '',
      county: county,
      sub_region: village,
      latitude: item.location ? item.location.lat : null,
      longitude: item.location ? item.location.lng : null,
      images: imageUrls,
      
      // Enforce Data Staging Queue rules (always start basic & unapproved)
      tier: 'basic',
      is_approved: false
    };

    upsertListings.push(dbListing);
  }

  if (upsertListings.length > 0) {
    console.log(`Executing bulk upsert of ${upsertListings.length} listings into 'listings' table...`);
    const { data, error } = await supabase
      .from('listings')
      .upsert(upsertListings, { onConflict: 'slug' });

    if (error) {
      console.error('Database Upsert Error:', error.message);
      console.log('Database error details. Do listings table exist? Run schema.sql first.');
    } else {
      console.log('--- INGESTION WORKFLOW COMPLETED SUCCESSFULLY ---');
      console.log(`Upserted listings: ${upsertListings.map(l => l.slug).join(', ')}`);
    }
  }
}

// Execute Ingestion Pipeline
runIngestion().catch(console.error);
