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

// Help function to standardize raw Google Maps categories to match frontend dropdown filters
function mapCategory(rawCategory = '') {
  const cat = rawCategory.toLowerCase();
  
  if (cat.includes('builder') || cat.includes('construction') || cat.includes('plumber') || cat.includes('carpenter') || cat.includes('roofer') || cat.includes('electrician') || cat.includes('handyman') || cat.includes('gardener') || cat.includes('landscap') || cat.includes('painter') || cat.includes('decorator') || cat.includes('architect') || cat.includes('cleaning') || cat.includes('pest') || cat.includes('aerial') || cat.includes('repair')) {
    return 'Construction & Home Maintenance';
  }
  if (cat.includes('salon') || cat.includes('beauty') || cat.includes('hair') || cat.includes('nail') || cat.includes('spa') || cat.includes('clinic') || cat.includes('dentist') || cat.includes('doctor') || cat.includes('medical') || cat.includes('chiropract') || cat.includes('massage') || cat.includes('health') || cat.includes('wellness') || cat.includes('physio') || cat.includes('podiatry') || cat.includes('hearing') || cat.includes('optician') || cat.includes('pharmacy')) {
    return 'Health & Beauty';
  }
  if (cat.includes('accountant') || cat.includes('lawyer') || cat.includes('solicitor') || cat.includes('consultant') || cat.includes('marketing') || cat.includes('agency') || cat.includes('finance') || cat.includes('adviser') || cat.includes('real estate') || cat.includes('estate agent') || cat.includes('funeral') || cat.includes('auction') || cat.includes('travel') || cat.includes('surveyor')) {
    return 'Professional Services';
  }
  if (cat.includes('mechanic') || cat.includes('garage') || cat.includes('auto') || cat.includes('car repair') || cat.includes('dealer') || cat.includes('tyre') || cat.includes('car wash') || cat.includes('land rover')) {
    return 'Car & Automotive';
  }
  if (cat.includes('hotel') || cat.includes('motel') || cat.includes('guesthouse') || cat.includes('bed & breakfast') || cat.includes('b&b') || cat.includes('lodging') || cat.includes('hostel')) {
    return 'Hotels & Motels';
  }
  if (cat.includes('restaurant') || cat.includes('cafe') || cat.includes('coffee') || cat.includes('bakery') || cat.includes('tea room') || cat.includes('diner') || cat.includes('bistro') || cat.includes('grill') || cat.includes('steakhouse')) {
    return 'Restaurants & Cafés';
  }
  return 'Professional Services'; // Fallback for general local services
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

    // Configure the Google Maps Scraper Actor with ONLY non-pub/non-alcohol businesses from Bourton Browser
    const input = {
      searchStringsArray: [
        "Cotswold Neuro Rehab Gloucestershire",
        "TM Hairdressing Bourton-on-the-Water",
        "Colour Your Home Cotswolds",
        "Brooks Window Cleaning Bourton-on-the-Water",
        "Tina Hamer The Back Woman Bourton-on-the-Water",
        "Batsford Arboretum Moreton-in-Marsh",
        "Dave's Aerials & Satellites Bourton-on-the-Water",
        "W J Wright Funeral Directors Bourton-on-the-Water",
        "Kendall & Davies Solicitors Bourton-on-the-Water",
        "Stones Memorials Bourton-on-the-Water",
        "Badham Pharmacy Stow-on-the-Wold",
        "Badham Pharmacy Upper Rissington",
        "Bennett Pest Control Cotswolds",
        "Bourton Land Rover Bourton-on-the-Water",
        "Zena the Barber Bourton-on-the-Water",
        "VJ Collett Bourton-on-the-Water",
        "Bourton Podiatry Clinic Upper Slaughter",
        "Riverside Dental Practice Bourton-on-the-Water",
        "Mossinator Bourton-on-the-Water",
        "Ear Care Clinics Bourton-on-the-Water",
        "Stow Physio at Bourton",
        "A Breath of Fresh Hair by Paula Bourton-on-the-Water",
        "Mike Ciger Landscaping Bourton-on-the-Water",
        "Designer Pooch Bourton-on-the-Water",
        "Stow Travel Upper Rissington",
        "Ted George Estate Agents Shipton-under-Wychwood",
        "Massage Cotswold Bourton-on-the-Water",
        "Greener Ohms Electrical Witney",
        "G&O Engineers Witney",
        "Bourton Library Bourton-on-the-Water",
        "Clarke & Humphries Bourton-on-the-Water",
        "The Mobility Store Bourton-on-the-Water",
        "FAB IT Rescue Bourton-on-the-Water",
        "Laura Williams Coaching Cotswolds",
        "Chorley's Auctioneers Prinknash Abbey",
        "The Lady Painters Bourton-on-the-Water",
        "Birdland Park and Gardens Bourton-on-the-Water",
        "Cotswold Motor Museum Bourton-on-the-Water",
        "Croft Restaurant Bourton-on-the-Water",
        "Bakery on the Water Bourton-on-the-Water",
        "The Chestnut Tree Bourton-on-the-Water",
        "The Den Bourton-on-the-Water",
        "Beautylicious Bourton-on-the-Water",
        "Dragonfly Maze Bourton-on-the-Water"
      ],
      maxCrawledPlacesPerSearch: 1,
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

  // Fallback to high-quality Mock data from Bourton Browser document if no items were fetched
  if (rawItems.length === 0) {
    console.log('No Apify data. Using mock listings from Bourton Browser document for ingestion...');
    rawItems = [
      {
        title: "Batsford Arboretum & Garden Centre",
        subTitle: "Arboretum, Garden Centre & Cafe",
        phone: "+44 1608 730352",
        website: "https://www.batsarb.co.uk",
        address: "Batsford, Moreton-in-Marsh, GL56 9AT",
        city: "Moreton-in-Marsh",
        postalCode: "GL56 9AT",
        location: { lat: 51.9897, lng: -1.7242 },
        imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
        totalScore: 4.8,
        reviewsCount: 450,
        placeId: "google-place-batsford-arboretum"
      },
      {
        title: "Riverside Dental Practice",
        subTitle: "Dental Care Clinic",
        phone: "+44 1451 820306",
        website: "https://www.riverside-dental-practice.co.uk",
        address: "Moore Rd, Bourton-on-the-Water, GL54 2AZ",
        city: "Bourton-on-the-Water",
        postalCode: "GL54 2AZ",
        location: { lat: 51.8850, lng: -1.7560 },
        imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
        totalScore: 4.9,
        reviewsCount: 95,
        placeId: "google-place-riverside-dental"
      }
    ];
  }

  const upsertListings = [];
  const processedSlugs = new Set();
  const processedPlaceIds = new Set();

  for (const item of rawItems) {
    const title = item.title || item.name;
    if (!title) {
      console.log("Skipping listing due to missing title name.");
      continue;
    }

    // Exclude pubs, bars, breweries, wine shops, distilleries, inns, and alcohol-promoting businesses
    const rawCategory = (item.categoryName || item.subTitle || '').toLowerCase();
    const cleanTitle = title.toLowerCase();
    if (
      rawCategory.includes('pub') || rawCategory.includes('bar') || rawCategory.includes('tavern') ||
      rawCategory.includes('brewery') || rawCategory.includes('vineyard') || rawCategory.includes('distillery') ||
      rawCategory.includes('wine') || rawCategory.includes('liquor') || rawCategory.includes('nightclub') ||
      rawCategory.includes('club') ||
      cleanTitle.includes(' pub') || cleanTitle.includes('bar ') || cleanTitle.includes('tavern') ||
      cleanTitle.includes('brewery') || cleanTitle.includes('vineyard') || cleanTitle.includes('distillery') ||
      cleanTitle.includes(' arms') || cleanTitle.includes(' inn')
    ) {
      console.log(`Skipping pub/alcohol-promoting business: "${title}"`);
      continue;
    }

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

    const village = item.city || item.sub_region || 'Bourton-on-the-Water';
    const slug = generateSlug(title, village);

    // Deduplicate in batch
    const placeId = item.placeId || null;
    if (processedSlugs.has(slug)) {
      console.log(`Skipping duplicate slug in batch: "${slug}"`);
      continue;
    }
    if (placeId && processedPlaceIds.has(placeId)) {
      console.log(`Skipping duplicate placeId in batch: "${placeId}"`);
      continue;
    }
    processedSlugs.add(slug);
    if (placeId) processedPlaceIds.add(placeId);

    console.log(`Processing listing: "${title}" (Slug: ${slug})...`);

    // Handle Image Streaming
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

    // Build database mapping
    const dbListing = {
      title: title,
      slug: slug,
      description: item.subTitle || item.description || `Local business featured in Bourton Browser, ${village}, Cotswolds.`,
      category: mapCategory(item.categoryName || item.subTitle || 'Local Business'),
      phone: item.phone || item.phoneNormalized || null,
      website: item.website || null,
      whatsapp: item.whatsapp || null,
      address: item.address || '',
      postcode: item.postalCode || item.zip || '',
      town: village,
      latitude: lat,
      longitude: lng,
      images: imageUrls,
      
      // Seed ratings & hours directly from scraped Google Maps dataset fields
      rating: item.totalScore || null,
      reviews_count: item.reviewsCount || null,
      opening_hours: item.openingHours || null,
      google_place_id: placeId,

      // Ingest live immediately
      tier: 'basic',
      is_approved: true
    };

    upsertListings.push(dbListing);
  }

  if (upsertListings.length > 0) {
    let totalUpserted = 0;
    console.log(`Saving ${upsertListings.length} listings to Supabase database...`);

    for (const listing of upsertListings) {
      // Find existing record by slug or google_place_id to avoid constraint violations
      let existingMatch = null;
      
      if (listing.google_place_id) {
        const { data: placeMatch } = await supabase
          .from('listings')
          .select('id')
          .eq('google_place_id', listing.google_place_id)
          .maybeSingle();
        if (placeMatch) existingMatch = placeMatch;
      }
      
      if (!existingMatch && listing.slug) {
        const { data: slugMatch } = await supabase
          .from('listings')
          .select('id')
          .eq('slug', listing.slug)
          .maybeSingle();
        if (slugMatch) existingMatch = slugMatch;
      }

      if (existingMatch) {
        const { error } = await supabase
          .from('listings')
          .update(listing)
          .eq('id', existingMatch.id);

        if (error) {
          console.error(`Error updating listing "${listing.title}":`, error.message);
        } else {
          totalUpserted++;
        }
      } else {
        const { error } = await supabase
          .from('listings')
          .insert(listing);

        if (error) {
          console.error(`Error inserting listing "${listing.title}":`, error.message);
        } else {
          totalUpserted++;
        }
      }
    }

    console.log('--- INGESTION WORKFLOW COMPLETED SUCCESSFULLY ---');
    console.log(`Total listings saved/upserted: ${totalUpserted}/${upsertListings.length}`);
  }
}

// Execute Ingestion Pipeline
runIngestion().catch(console.error);
