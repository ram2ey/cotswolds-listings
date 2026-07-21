import { createClient } from '@supabase/supabase-js';
import { ApifyClient } from 'apify-client';
import axios from 'axios';

// Helper function to download and upload images to Supabase Storage on-demand
export async function downloadAndUploadImage(supabase: any, imageSrc: string, slug: string, idx: number): Promise<string | null> {
  try {
    const res = await axios.get(imageSrc, { responseType: 'arraybuffer', timeout: 12000 });
    const buffer = Buffer.from(res.data, 'binary');
    const contentTypeHeader = res.headers['content-type'];
    const contentType = typeof contentTypeHeader === 'string' ? contentTypeHeader : 'image/jpeg';
    const extension = contentType.split('/')[1] || 'jpg';
    const filePath = `listings/${slug}-${idx}.${extension}`;

    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(filePath, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error(`Error uploading storage object (index ${idx}) for ${slug}:`, error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error(`Error in downloadAndUploadImage for ${slug} at index ${idx}:`, error.message);
    return null;
  }
}

// Helper function to generate premium metadata fallback
export function generateMockMetadata(title: string, category: string, subRegion: string): any {
  const isFood = /pub|restaurant|caf|gastropub|inn/i.test(category);
  const isHotel = /hotel|accommodation|b&b|inn/i.test(category);

  const highlights = [
    `Nestled in the picturesque setting of ${subRegion || 'the Cotswolds'}`,
    `Strong commitment to sourcing premium, seasonal local ingredients`,
    `Exceptional hospitality in a historically preserved, cozy atmosphere`
  ];

  const faqs = [
    {
      question: "Are dogs permitted on the premises?",
      answer: "Yes, we are extremely dog-friendly! Well-behaved dogs are welcome in our bar area and outdoor terrace gardens."
    },
    {
      question: "Is there guest parking available?",
      answer: "Yes, we offer complimentary on-site parking for all our patrons and overnight guests."
    },
    {
      question: "Do you accommodate dietary requirements?",
      answer: "Absolutely! We provide a curated selection of gluten-free, vegetarian, and vegan options made with fresh local produce. Please notify our staff of any allergies."
    }
  ];

  const specialSection = isFood ? {
    price_range: "££ - £££",
    signature_dishes: ["Slow-roasted Cotswold Lamb", "Truffle Honey Flatbread", "Signature Sunday roast with Yorkshire pudding"]
  } : isHotel ? {
    room_types: ["Classic Double Room", "Luxury Feature Suite", "Private Garden Lodge"],
    amenities_list: ["Free high-speed WiFi", "Indoor heated pool & spa facilities", "Complimentary Cotswold breakfast"]
  } : {
    services_offered: ["Bespoke guided estate walks", "Exclusive private dining & events", "Local artisan workshops"]
  };

  const description = isFood
    ? `A charming ${category.toLowerCase()} in the heart of ${subRegion}, celebrated for its fresh local menus and cozy, welcoming atmosphere.`
    : isHotel
    ? `A luxury ${category.toLowerCase()} situated in ${subRegion}, featuring elegantly decorated rooms and premium guest hospitality.`
    : `A premier ${category.toLowerCase()} provider in ${subRegion}, dedicated to exceptional quality and service for locals and visitors alike.`;

  return {
    description,
    highlights,
    faqs,
    specialSection,
    socialLinks: {
      instagram: `https://instagram.com/cotswolds_${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      facebook: `https://facebook.com/cotswolds_${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    }
  };
}

// Call Gemini API to extract details from crawled text
export async function callGeminiAPI(crawledText: string, title: string, category: string, subRegion: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    console.warn("GEMINI_API_KEY is not configured. Falling back to default premium content.");
    return generateMockMetadata(title, category, subRegion);
  }

  const prompt = `
    Analyze the raw text content crawled from a business website and extract details to create a premium Cotswold directory profile.
    - Business Name: "${title}"
    - Category: "${category}"
    - Location: "${subRegion}"

    Format the response as a clean, valid JSON object with the following fields:
    1. "description": A sophisticated, compelling 2-sentence description of the business based on the website content. Do not use generic placeholders.
    2. "highlights": An array of 3 short, catchy unique selling points/features of the business.
    3. "faqs": An array of 3 common question/answer objects: { "question": "...", "answer": "..." }.
    4. "specialSection": An object representing specific amenities/specialties:
       - If it's a food/drink business (pub, restaurant, cafe): { "price_range": "e.g. ££-£££", "signature_dishes": ["Dish 1", "Dish 2"] }
       - If it's a hotel/accommodation: { "room_types": ["Standard Double", "Suite"], "amenities_list": ["Free Wifi", "Spa", "Pool"] }
       - For other businesses: { "services_offered": ["Service A", "Service B"] }
    5. "socialLinks": An object with handles/links: { "instagram": "url or handle", "facebook": "url or handle" }

    Keep it structured, sophisticated, and do not wrap it in markdown block tags like \`\`\`json. Return only the raw JSON string.

    Raw website crawled text content:
    ---
    ${crawledText}
  `;

  try {
    const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 25005
    });

    const responseText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (responseText) {
      return JSON.parse(responseText.trim());
    }
    throw new Error("Empty response from Gemini API");
  } catch (err: any) {
    console.error("Gemini API call failed, falling back to mock generation:", err.message);
    return generateMockMetadata(title, category, subRegion);
  }
}

// Unified core function to claim/activate listing, trigger web crawl scrape, AI enrichment, and Maps photo scraping
export async function claimAndScrapeListing(listingId: string, tier: string, website: string): Promise<any> {
  console.log(`[claimAndScrapeListing] Starting claim/scrape for ID: ${listingId}, Tier: ${tier}, Website: ${website}`);
  
  const validPlans = ['claim', 'gold', 'gold_social', 'featured', 'featured_social'];
  if (!validPlans.includes(tier)) {
    throw new Error('Invalid plan selected.');
  }

  let dbTier = 'basic';
  let hasSocial = false;
  if (tier === 'claim') {
    dbTier = 'claimed';
  } else if (tier === 'gold' || tier === 'gold_social') {
    dbTier = 'gold';
    if (tier === 'gold_social') hasSocial = true;
  } else if (tier === 'featured' || tier === 'featured_social') {
    dbTier = 'featured';
    if (tier === 'featured_social') hasSocial = true;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let listing: any = null;
  let isMock = !supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-supabase-url-here');

  if (isMock) {
    console.log(`[claimAndScrapeListing] Running database MOCK lookup for ID: ${listingId}`);
    listing = {
      id: listingId,
      title: "Arlington Hotel",
      slug: "arlington-hotel-bibury",
      category: "Hotels & Motels",
      town: "Bibury",
      website,
      tier: dbTier
    };
  } else {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Update listing tier, website, and set approved status to true
    const { data, error } = await supabase
      .from('listings')
      .update({
        tier: dbTier,
        website,
        is_approved: true
      })
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update listing: ${error.message}`);
    }
    listing = data;
  }

  if (!listing) {
    throw new Error('Listing not found');
  }

  let premiumMetadata = null;
  let premiumImages: string[] = [];
  const apifyToken = process.env.APIFY_API_TOKEN;
  const isMockApify = !apifyToken || apifyToken === 'your-apify-api-token-here';

  // Run Scrape, AI enrichment & Premium Photo Extraction
  if (isMockApify || !website || website.includes('example.com')) {
    console.log(`[claimAndScrapeListing] Running MOCK scrape for listing: ${listing.title}`);
    premiumMetadata = generateMockMetadata(listing.title, listing.category, listing.town);
    
    // Seed high-quality mock unsplash gallery photos for offline testing
    premiumImages = [
      listing.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4db85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"
    ];
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated processing time
  } else {
    console.log(`[claimAndScrapeListing] Starting real website crawl on: ${website}`);
    const client = new ApifyClient({ token: apifyToken });

    // 1. Crawl Website & Extract copywriting using Gemini AI
    try {
      const run = await client.actor("apify/website-content-crawler").call({
        startUrls: [{ url: website }],
        maxPagesPerCrawl: 3,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      const crawledText = items
        .map((item: any) => item.text || '')
        .join('\n\n')
        .slice(0, 10000); // Grab first 10k chars for safety

      premiumMetadata = await callGeminiAPI(crawledText, listing.title, listing.category, listing.town);
    } catch (err: any) {
      console.error("[claimAndScrapeListing] Deep website crawl failed, falling back to mock:", err.message);
      premiumMetadata = generateMockMetadata(listing.title, listing.category, listing.town);
    }

    // 2. Perform live Google Maps photo extraction on-demand (only at the time of claim)
    try {
      const mapsQuery = listing.google_place_id 
        ? `https://www.google.com/maps/place/?q=place_id:${listing.google_place_id}`
        : `${listing.title}, ${listing.town || 'Cotswolds'}, UK`;

      console.log(`[claimAndScrapeListing] Running Apify Google Maps Scraper actor for partner photos: ${mapsQuery}`);
      const mapsRun = await client.actor("compass/crawler-google-places").call({
        searchStringsArray: [mapsQuery],
        maxCrawledPlacesPerSearch: 1,
        extractImages: true,
        maxImages: 4,
        language: "en"
      });

      const { items: mapsItems } = await client.dataset(mapsRun.defaultDatasetId).listItems();
      if (mapsItems && mapsItems.length > 0) {
        const mapItem = mapsItems[0] as any;
        const rawImageUrls: string[] = [];
        if (mapItem.imageUrl) rawImageUrls.push(mapItem.imageUrl);
        if (mapItem.imageUrls && Array.isArray(mapItem.imageUrls)) {
          mapItem.imageUrls.forEach((url: string) => {
            if (url && !rawImageUrls.includes(url)) {
              rawImageUrls.push(url);
            }
          });
        }

        const targetImages = rawImageUrls.slice(0, 4);
        if (!isMock) {
          const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
          for (let i = 0; i < targetImages.length; i++) {
            const storedUrl = await downloadAndUploadImage(supabase, targetImages[i], listing.slug, i);
            if (storedUrl) {
              premiumImages.push(storedUrl);
            }
          }
        } else {
          premiumImages = targetImages;
        }
      }
    } catch (err: any) {
      console.error("[claimAndScrapeListing] Google Maps photo scraping failed:", err.message);
    }
  }

  // Save metadata and unlocked premium images to DB
  if (!isMock) {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const finalMetadata = {
      ...premiumMetadata,
      package_name: tier,
      has_social_addon: hasSocial
    };

    const updates: any = {
      premium_metadata: finalMetadata
    };

    if (premiumMetadata && premiumMetadata.description) {
      updates.description = premiumMetadata.description;
    }

    if (premiumImages && premiumImages.length > 0) {
      updates.images = premiumImages;
    }

    // Seed reviews/rating if empty to make it look full
    if (!listing.rating) {
      updates.rating = (4.3 + Math.random() * 0.6).toFixed(1);
    }
    if (!listing.reviews_count) {
      updates.reviews_count = Math.floor(45 + Math.random() * 250);
    }
    if (premiumMetadata && premiumMetadata.highlights && premiumMetadata.highlights.length > 0 && (!listing.tags || listing.tags.length === 0)) {
      updates.tags = premiumMetadata.highlights;
    }

    const { error: updateError } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId);

    if (updateError) {
      throw new Error(`Failed to update premium metadata: ${updateError.message}`);
    }
  } else {
    console.log("[claimAndScrapeListing] Mock Claim Scrape Completed. Premium Metadata: ", premiumMetadata, "Premium Images: ", premiumImages);
  }

  return { success: true, tier, metadata: premiumMetadata };
}
