"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from "../../components/Navbar";
import { 
  MapPin, 
  Phone, 
  Globe, 
  MessageSquare, 
  Mail, 
  Compass, 
  ChevronLeft, 
  ArrowUpRight, 
  Clock, 
  Star, 
  ShieldAlert, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-supabase-url"))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  phone?: string;
  website?: string;
  whatsapp?: string;
  email?: string;
  address: string;
  postcode: string;
  town: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  tier: 'gold' | 'silver' | 'basic';
  is_approved: boolean;
  created_at?: string;
  rating?: number;
  reviews_count?: number;
  tags?: string[];
  opening_hours?: any;
  premium_metadata?: {
    highlights?: string[];
    faqs?: { question: string; answer: string }[];
    specialSection?: {
      price_range?: string;
      signature_dishes?: string[];
      room_types?: string[];
      amenities_list?: string[];
      services_offered?: string[];
    };
    socialLinks?: {
      instagram?: string;
      facebook?: string;
    };
  };
}

// Fallback high-fidelity mock dataset for offline testing
const MOCK_LISTINGS: Listing[] = [
  {
    id: "mock-1",
    title: "Broadway Hotel & Suites",
    slug: "broadway-hotel-suites-broadway",
    description: "A premium boutique hotel situated in the heart of Broadway village, offering historic charm with modern luxury. Features cozy suites, peaceful gardens, high-quality room service, and is conveniently located near the local highlights of Broadway.",
    category: "Hotels & Motels",
    phone: "+44 1386 852255",
    website: "https://broadwayhotelsuites.example.com",
    whatsapp: "441386852255",
    email: "info@broadwayhotelsuites.example.com",
    address: "High Street, Broadway",
    postcode: "WR12 7DU",
    town: "Broadway",
    latitude: 52.0366,
    longitude: -1.8552,
    images: ["/hero-bridge.jpg"],
    tier: "gold",
    is_approved: true,
    rating: 4.8,
    reviews_count: 245,
    tags: ["Hotel", "Suites", "Gardens"],
    opening_hours: [
      { "day": "Monday", "hours": "Open 24 hours" },
      { "day": "Tuesday", "hours": "Open 24 hours" },
      { "day": "Wednesday", "hours": "Open 24 hours" },
      { "day": "Thursday", "hours": "Open 24 hours" },
      { "day": "Friday", "hours": "Open 24 hours" },
      { "day": "Saturday", "hours": "Open 24 hours" },
      { "day": "Sunday", "hours": "Open 24 hours" }
    ],
    premium_metadata: {
      highlights: [
        "Spacious luxury suites",
        "Scenic private guest gardens",
        "Valet guest parking"
      ],
      faqs: [
        {
          question: "Is room service available 24/7?",
          answer: "Yes, room service is available 24 hours a day for all suite bookings."
        }
      ],
      specialSection: {
        room_types: ["Junior Suite", "Executive Suite", "Grand Penthouse"],
        amenities_list: ["Room Service", "Private Gardens", "High-speed Wi-Fi"]
      },
      socialLinks: {
        instagram: "https://instagram.com/broadway_hotel_suites",
        facebook: "https://facebook.com/broadway_hotel_suites"
      }
    }
  },
  {
    id: "mock-2",
    title: "Cotswold Tea Room",
    slug: "cotswold-tea-room-kingham",
    description: "A traditional Cotswold tea room serving hand-baked pastries, hot fresh teas, and lunch menus. Features stone walls, comfortable seating, and a selection of local jams and products. Standard ingredients are organic and sourced from local farms.",
    category: "Restaurants & Cafés",
    phone: "+44 1608 658389",
    website: "https://cotswoldtearoom.example.com",
    whatsapp: "441608658389",
    email: "welcome@cotswoldtearoom.example.com",
    address: "Church Street, Kingham",
    postcode: "OX7 6YA",
    town: "Kingham",
    latitude: 51.9103,
    longitude: -1.6148,
    images: ["/hero-bridge.jpg"],
    tier: "gold",
    is_approved: true,
    rating: 4.7,
    reviews_count: 198,
    tags: ["Tea", "Cakes", "Lunch"],
    opening_hours: [
      { "day": "Monday", "hours": "09:00 AM - 05:00 PM" },
      { "day": "Tuesday", "hours": "09:00 AM - 05:00 PM" },
      { "day": "Wednesday", "hours": "09:00 AM - 05:00 PM" },
      { "day": "Thursday", "hours": "09:00 AM - 05:00 PM" },
      { "day": "Friday", "hours": "09:00 AM - 05:00 PM" },
      { "day": "Saturday", "hours": "09:00 AM - 06:00 PM" },
      { "day": "Sunday", "hours": "10:00 AM - 04:00 PM" }
    ],
    premium_metadata: {
      highlights: [
        "Loose-leaf organic teas",
        "Fresh daily baked pastries",
        "Scenic outdoor courtyard seating"
      ],
      faqs: [
        {
          question: "Do you offer gluten-free options?",
          answer: "Yes, we have a daily selection of gluten-free cakes and bread alternatives."
        }
      ],
      specialSection: {
        price_range: "££ - £££",
        signature_dishes: ["Loose-leaf Earl Grey", "Warm Scones with Clotted Cream", "Traditional Cream Tea"]
      },
      socialLinks: {
        instagram: "https://instagram.com/cotswold_tea_room",
        facebook: "https://facebook.com/cotswold_tea_room"
      }
    }
  },
  {
    id: "mock-3",
    title: "Cotswolds Builders Ltd",
    slug: "cotswolds-builders-ltd-broadway",
    description: "An award-winning building contractor offering extensions, roofing, and general property maintenance in Moreton-in-Marsh. Known for premium stonework and carpentry.",
    category: "Construction & Home Maintenance",
    phone: "+44 1386 700413",
    website: "https://www.cotswoldbuilders.example.com",
    whatsapp: "",
    email: "info@cotswoldbuilders.example.com",
    address: "Bourton-on-the-Hill, Moreton-in-Marsh",
    postcode: "GL56 9AQ",
    town: "Moreton-in-Marsh",
    latitude: 51.9967,
    longitude: -1.7483,
    images: [],
    tier: "silver",
    is_approved: true
  },
  {
    id: "mock-4",
    title: "Cotswold Wellness Spa",
    slug: "cotswold-wellness-spa-bibury",
    description: "A luxury health and beauty destination in Bibury. Offering massage treatments, skin care, facials, manicure and wellness packages in a serene riverside setting.",
    category: "Health & Beauty",
    phone: "+44 1451 820259",
    website: "https://cotswoldwellnessspa.example.com",
    whatsapp: "",
    address: "Awkward Hill, Bibury, Cirencester",
    postcode: "GL7 5ND",
    town: "Bibury",
    latitude: 51.7583,
    longitude: -1.8319,
    images: [],
    tier: "basic",
    is_approved: true
  },
  {
    id: "mock-5",
    title: "Cotswold Auto Care",
    slug: "cotswold-auto-care-broadway",
    description: "Your local automotive specialists for MOT testing, engine diagnostics, vehicle repairs, and regular maintenance servicing. Offering prompt, reliable service.",
    category: "Car & Automotive",
    phone: "+44 1386 852390",
    website: "https://cotswoldautocare.example.com",
    whatsapp: "",
    address: "Middlecombe Hill, Broadway",
    postcode: "WR12 7LB",
    town: "Broadway",
    latitude: 52.0244,
    longitude: -1.8322,
    images: [],
    tier: "silver",
    is_approved: true
  }
];

export default function ListingProfile() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Claim listing flow states
  const [isClaimModalOpen, setIsClaimModalOpen] = useState<boolean>(false);
  const [claimStep, setClaimStep] = useState<number>(1);
  const [selectedPlan, setSelectedPlan] = useState<'silver' | 'gold'>('silver');
  const [websiteInput, setWebsiteInput] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [claimError, setClaimError] = useState<string | null>(null);
  const [scrapeStatusText, setScrapeStatusText] = useState<string>('Processing secure payment...');

  // Handles submitting the listing claim to our claim API route
  const handleClaimSubmit = async () => {
    if (!listing) return;
    setClaimError(null);
    setClaimStep(4); // Show progress screen
    
    const messages = [
      'Processing your secure payment...',
      'Payment authorised successfully ✓',
      'Setting up your business profile...',
      'Analysing your website content...',
      'Generating your highlights and FAQs...',
      'Crafting your premium listing details...',
      'Almost there — applying finishing touches...',
      'Saving your new Gold Partner status...',
      'Preparing your premium profile...'
    ];
    
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < messages.length - 1) {
        msgIdx++;
        setScrapeStatusText(messages[msgIdx]);
      }
    }, 2500);

    try {
      const res = await fetch('/api/listings/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: listing.id,
          tier: selectedPlan,
          website: websiteInput
        })
      });

      clearInterval(interval);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Server error occurred during payment processing.');
      }

      setScrapeStatusText('Success! Listing Claimed and Scraped Successfully.');
      
      setTimeout(() => {
        setIsClaimModalOpen(false);
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      clearInterval(interval);
      setClaimError(err.message || 'An unexpected error occurred during claims processing.');
      setClaimStep(3); // Go back to payment step to allow correcting details
    }
  };

  useEffect(() => {
    if (!slug) return;

    async function getListingDetails() {
      try {
        setLoading(true);
        setError(null);

        // Try querying Supabase first
        if (supabase) {
          const { data, error: dbError } = await supabase
            .from('listings')
            .select('*')
            .eq('slug', slug)
            .eq('is_approved', true)
            .single();

          if (dbError) {
            console.warn("Database slug fetch failed, trying mock fallback: ", dbError.message);
            // Search inside mock items
            const mock = MOCK_LISTINGS.find(item => item.slug === slug);
            if (mock) {
              setListing(mock);
            } else {
              setError("We could not find a listing matching the specified slug.");
            }
          } else if (data) {
            setListing(data);
          }
        } else {
          // Offline mock lookup
          const mock = MOCK_LISTINGS.find(item => item.slug === slug);
          if (mock) {
            setListing(mock);
          } else {
            setError("We could not find a listing matching the specified slug.");
          }
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while retrieval.");
      } finally {
        setLoading(false);
      }
    }

    getListingDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 gap-4">
        <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
        <p className="text-sm font-medium text-stone-500 font-sans">Loading profile details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 px-4 text-center">
        <ShieldAlert className="h-14 w-14 text-rose-500 mb-4" />
        <h2 className="text-2xl font-serif font-bold text-stone-900">Listing Not Available</h2>
        <p className="text-sm text-stone-500 mt-2 max-w-md">
          {error || "The profile is either unapproved, deleted, or does not exist."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Directory
        </Link>
      </div>
    );
  }

  const isGold = listing.tier === 'gold';
  const isSilver = false; // Silver tier retired — all claimed listings are Gold
  
  // Format WhatsApp Link
  const whatsappNumber = listing.whatsapp || listing.phone;
  const cleanWhatsapp = whatsappNumber ? whatsappNumber.replace(/[^\d]/g, '') : '';
  const whatsappUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=Hi%20${encodeURIComponent(listing.title)},%20I%20saw%20your%20profile%20on%20Cotswolds%20Pages%20and%20wanted%20to%20get%20in%20touch!`
    : '';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col justify-between">
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Page Content */}
      <main className="flex-1 pb-16">
        {/* Cover Photo Hero banner */}
        <div className="relative h-64 md:h-[400px] w-full bg-stone-950 overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-700 bg-stone-900">
              <Compass className="h-20 w-20 stroke-1 animate-pulse" />
            </div>
          )}
          
          {/* Dark bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />
          
          {/* Cover Content Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-md mb-3">
                  {listing.category}
                </span>
                
                <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-white mb-2">
                  {listing.title}
                </h1>

                {listing.rating && (
                  <div className="flex items-center gap-2 mb-3 text-xs font-bold text-stone-250">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3.5 w-3.5 ${
                            i < Math.floor(Number(listing.rating) || 0) 
                              ? 'fill-current' 
                              : 'opacity-30'
                          }`} 
                        />
                      ))}
                    </div>
                    <span>{listing.rating} out of 5</span>
                    <span className="opacity-60">•</span>
                    <span className="opacity-80">{listing.reviews_count || 0} reviews</span>
                  </div>
                )}
                
                <p className="flex items-center gap-1.5 text-sm text-stone-300 font-medium">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  {listing.address}, {listing.town}
                </p>
              </div>

              {/* Tiers Badge Indicators */}
              <div className="flex gap-2">
                {isGold && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-stone-950 shadow-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-950 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-950"></span>
                    </span>
                    Gold Partner
                  </span>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Split Layout grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Column 1: Detailed Description & Photo Gallery */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Detailed Description Block */}
              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-xs">
                <h3 className="text-lg font-serif font-bold text-stone-950 border-b border-stone-100 pb-3 mb-4">
                  About Business
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                  {listing.description || `Welcome to ${listing.title}. This verified business is located in the lovely Cotswolds town of ${listing.town}, offering high-quality hospitality and services to residents and tourists alike.`}
                </p>
              </div>

              {/* Premium Features & Highlights (Claimed Listings Only) */}
              {isGold && listing.premium_metadata && (
                <>
                  {/* Unique Highlights */}
                  {listing.premium_metadata.highlights && listing.premium_metadata.highlights.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 rounded-2xl p-8 border border-amber-500/20 shadow-xs">
                      <h3 className="text-lg font-serif font-bold text-stone-950 border-b border-amber-500/10 pb-3 mb-4">
                        Why Visit Us
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {listing.premium_metadata.highlights.map((item, idx) => (
                          <div key={idx} className="flex gap-2.5 items-start">
                            <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                            <span className="text-stone-850 text-sm leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Custom Feature Card (Menus/Amenities) */}
                  {listing.premium_metadata.specialSection && (
                    <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-xs">
                      <h3 className="text-lg font-serif font-bold text-stone-950 border-b border-stone-100 pb-3 mb-5">
                        {/pub|restaurant|caf|gastropub|inn/i.test(listing.category) 
                          ? 'House Specialties & Pricing' 
                          : /hotel|accommodation|b&b/i.test(listing.category) 
                          ? 'Premium Amenities & Rooms' 
                          : 'Our Exclusive Services'}
                      </h3>
                      
                      {listing.premium_metadata.specialSection.price_range && (
                        <div className="mb-4 text-sm">
                          <span className="font-semibold text-stone-500">Price Guide: </span>
                          <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">{listing.premium_metadata.specialSection.price_range}</span>
                        </div>
                      )}

                      {/* Signature Dishes */}
                      {listing.premium_metadata.specialSection.signature_dishes && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Signature Items</p>
                          <div className="flex flex-wrap gap-2">
                            {listing.premium_metadata.specialSection.signature_dishes.map((dish, i) => (
                              <span key={i} className="px-3 py-1 bg-stone-50 border border-stone-200 text-stone-750 text-xs font-semibold rounded-lg">
                                {dish}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Amenities List */}
                      {listing.premium_metadata.specialSection.amenities_list && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Guest Amenities</p>
                          <div className="flex flex-wrap gap-2">
                            {listing.premium_metadata.specialSection.amenities_list.map((amenity, i) => (
                              <span key={i} className="px-3 py-1 bg-amber-50/50 border border-amber-100 text-stone-850 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Services Offered */}
                      {listing.premium_metadata.specialSection.services_offered && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Services Offered</p>
                          <div className="flex flex-wrap gap-2">
                            {listing.premium_metadata.specialSection.services_offered.map((service, i) => (
                              <span key={i} className="px-3 py-1 bg-stone-50 border border-stone-200 text-stone-750 text-xs font-semibold rounded-lg">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FAQs Accordion */}
                  {listing.premium_metadata.faqs && listing.premium_metadata.faqs.length > 0 && (
                    <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-xs">
                      <h3 className="text-lg font-serif font-bold text-stone-950 border-b border-stone-100 pb-3 mb-4">
                        Frequently Asked Questions
                      </h3>
                      <div className="space-y-3 mt-4">
                        {listing.premium_metadata.faqs.map((faq, idx) => (
                          <details key={idx} className="group border border-stone-200 rounded-xl p-4 bg-stone-50/50 hover:bg-stone-50 transition duration-150">
                            <summary className="font-semibold text-sm cursor-pointer select-none outline-hidden flex justify-between items-center text-stone-850">
                              <span>{faq.question}</span>
                              <span className="text-xs text-stone-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-3 text-stone-650 text-xs leading-relaxed whitespace-pre-line pl-1 border-l-2 border-amber-400">
                              {faq.answer}
                            </p>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Cover Photo Gallery section (Claimed Listings Only) */}
              {isGold && listing.images && listing.images.length > 1 && (
                <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-xs">
                  <h3 className="text-lg font-serif font-bold text-stone-950 border-b border-stone-100 pb-3 mb-6">
                    Photos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listing.images.map((img, idx) => (
                      <div key={idx} className="aspect-video w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={img} 
                          alt={`${listing.title} gallery ${idx + 1}`} 
                          className="w-full h-full object-cover hover:scale-103 transition-transform duration-350"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spatial Map Integration coordinates block */}
              {listing.latitude && listing.longitude && (
                <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-6">
                    <h3 className="text-lg font-serif font-bold text-stone-950">
                      Geographic Location
                    </h3>
                    <span className="text-[10px] text-stone-400 font-mono">
                      GPS: {listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
                    </span>
                  </div>
                  
                  {/* Embedded OpenStreetMap map frame */}
                  <div className="w-full h-72 rounded-xl overflow-hidden border border-stone-200 relative">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://maps.google.com/maps?q=${listing.latitude},${listing.longitude}&hl=en&z=14&output=embed`}
                      className="absolute inset-0 border-0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Quick Action Contact Sidebar */}
            <div className="space-y-6">
              
              {/* Claim Listing Sidebar Card (only for basic unclaimed listings) */}
              {listing.tier === 'basic' && (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-3">
                  <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-1.5">
                    <Star className="h-4.5 w-4.5 text-amber-600 fill-current animate-pulse" />
                    Is this your business?
                  </h4>
                  <p className="text-xs text-stone-605 leading-relaxed">
                    Claim this listing to upgrade to a premium partner status, display rating stars, add your website, and run a deep AI website scrape for highlights, FAQs, and custom menus.
                  </p>
                  <button
                    onClick={() => {
                      setIsClaimModalOpen(true);
                      setClaimStep(1);
                      setWebsiteInput(listing.website || '');
                    }}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 text-xs font-bold rounded-xl shadow-md transition cursor-pointer text-center"
                  >
                    Claim Listing Now
                  </button>
                </div>
              )}

              {/* Primary Lead Floating Container */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm sticky top-24">
                <div className="border-b border-stone-100 pb-4 mb-5 text-center">
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-stone-400">
                    Contact & Reservations
                  </h4>
                </div>

                <div className="space-y-4">
                  {/* Official Website Action */}
                  {listing.website && (
                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-3 bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer group"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="h-4.5 w-4.5 text-amber-500" />
                        Visit Official Website
                      </span>
                      <ExternalLink className="h-4 w-4 text-stone-400 group-hover:text-white transition" />
                    </a>
                  )}


                  {/* Phone direct link */}
                  {listing.phone && (
                    <a
                      href={`tel:${listing.phone.replace(/\s+/g, '')}`}
                      className="flex items-center gap-3 w-full px-4 py-3 border border-stone-200 hover:border-stone-300 text-stone-700 hover:text-stone-950 rounded-xl text-xs font-medium transition cursor-pointer"
                    >
                      <Phone className="h-4 w-4 text-stone-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Call Direct</p>
                        <p className="text-xs font-semibold">{listing.phone}</p>
                      </div>
                    </a>
                  )}

                  {/* Email direct link */}
                  {listing.email && (
                    <a
                      href={`mailto:${listing.email}`}
                      className="flex items-center gap-3 w-full px-4 py-3 border border-stone-200 hover:border-stone-300 text-stone-700 hover:text-stone-950 rounded-xl text-xs font-medium transition cursor-pointer"
                    >
                      <Mail className="h-4 w-4 text-stone-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Email Inquiries</p>
                        <p className="text-xs font-semibold">{listing.email}</p>
                      </div>
                    </a>
                  )}

                  {/* Social Media links for premium listings */}
                  {isGold && listing.premium_metadata?.socialLinks && (
                    <div className="flex gap-2 pt-2 border-t border-stone-100 mt-2">
                      {listing.premium_metadata.socialLinks.instagram && (
                        <a
                          href={listing.premium_metadata.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 border border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-950 rounded-xl text-[10px] font-bold transition cursor-pointer"
                        >
                          Instagram
                        </a>
                      )}
                      {listing.premium_metadata.socialLinks.facebook && (
                        <a
                          href={listing.premium_metadata.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 border border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-950 rounded-xl text-[10px] font-bold transition cursor-pointer"
                        >
                          Facebook
                        </a>
                      )}
                    </div>
                  )}

                  {/* Address box */}
                  <div className="flex items-start gap-3 w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-xs text-stone-600">
                    <MapPin className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-stone-455 uppercase font-bold tracking-wider">Location</p>
                      <p className="text-xs font-medium mt-0.5 leading-snug">{listing.address}</p>
                      <p className="text-xs font-bold text-stone-800 mt-0.5">{listing.postcode}</p>
                    </div>
                  </div>
                </div>

                {/* Sub-region Badge footer */}
                <div className="mt-5 pt-4 border-t border-stone-100 text-[10px] text-stone-450 text-center font-medium">
                  Verified Local Partner of the Cotswolds Tourism Guild
                </div>
              </div>

              {/* Opening Hours Container */}
              {listing.opening_hours && Array.isArray(listing.opening_hours) && listing.opening_hours.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <div className="border-b border-stone-100 pb-3 mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                    <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-stone-900">
                      Opening Hours
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {listing.opening_hours.map((item: any, idx: number) => {
                      const day = item.day || item.dayName || '';
                      const hours = item.hours || item.hoursText || '';
                      return (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-stone-550">{day}</span>
                          <span className="font-medium text-stone-800 text-right">{hours}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </main>

      {/* 4. Paid Claim Modal Dialog */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative animate-fade-in my-8 text-stone-900">
            
            {/* Modal Header */}
            <div className="border-b border-stone-150 px-6 py-4 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Claim Listing: {listing?.title}
                </h3>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
                  Step {claimStep} of 4 • {claimStep === 1 ? "Select Plan" : claimStep === 2 ? "Configure Website" : claimStep === 3 ? "Secure Checkout" : "Launching AI Crawl"}
                </p>
              </div>
              
              {claimStep < 4 && (
                <button
                  onClick={() => setIsClaimModalOpen(false)}
                  className="text-stone-405 hover:text-stone-700 font-bold text-lg cursor-pointer h-7 w-7 rounded-full flex items-center justify-center hover:bg-stone-200/50"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {claimError && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex gap-2 items-center">
                  <span className="font-bold">Error:</span> {claimError}
                </div>
              )}

              {/* STEP 1: Select Plan */}
              {claimStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-605 leading-relaxed">
                    Verify your ownership and unlock the full Gold Partner experience — premium search placement, a photo gallery, AI-generated highlights, and more.
                  </p>

                  {/* Gold-Only Plan Card */}
                  <div className="p-5 rounded-2xl border-2 border-amber-500 bg-gradient-to-br from-amber-500/5 to-amber-500/10 shadow-xs">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-sm font-extrabold text-amber-700">Gold Partner</span>
                        <p className="text-[10px] text-stone-500 mt-0.5">The complete premium listing experience.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-stone-900">£29</span>
                        <span className="text-[10px] font-normal text-stone-450">/mo</span>
                      </div>
                    </div>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-stone-700 font-medium">
                      <li>✓ Gold Partner Badge</li>
                      <li>✓ Priority Search Ranking</li>
                      <li>✓ Full Photo Gallery</li>
                      <li>✓ AI-Generated Highlights</li>
                      <li>✓ Star Ratings & Reviews</li>
                      <li>✓ Opening Hours Display</li>
                      <li>✓ Social Media Links</li>
                      <li>✓ Direct Contact Links</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => { setSelectedPlan('gold'); setClaimStep(2); }}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 rounded-xl text-xs font-bold transition shadow-md mt-2 cursor-pointer"
                  >
                    Continue — £29/mo
                  </button>
                </div>
              )}

              {/* STEP 2: Configure Website */}
              {claimStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-605 leading-relaxed">
                    Please provide your official business website. We will use it to personalise your listing with unique highlights, FAQs, and more.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400 block">
                      Official Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.lygonarmshotel.co.uk"
                      value={websiteInput}
                      onChange={(e) => setWebsiteInput(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-xs bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setClaimStep(1)}
                      className="flex-1 py-3 border border-stone-200 hover:border-stone-300 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (!websiteInput || !/^https?:\/\//i.test(websiteInput)) {
                          setClaimError("Please enter a valid website URL starting with http:// or https://");
                        } else {
                          setClaimError(null);
                          setClaimStep(3);
                        }
                      }}
                      className="flex-1 py-3 bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment Checkout */}
              {claimStep === 3 && (
                <div className="space-y-5">
                  {/* Elegant Glassmorphic Card Preview */}
                  <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-stone-850 to-stone-950 text-white p-6 flex flex-col justify-between shadow-lg relative overflow-hidden border border-stone-800">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
                    
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">Cotswolds Tourism Premium</span>
                      <span className="text-xs font-extrabold italic font-serif">Visa</span>
                    </div>

                    <div className="space-y-4">
                      {/* Card Number */}
                      <p className="font-mono text-base tracking-widest text-stone-200">
                        {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                      </p>

                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <p className="text-[8px] text-stone-500 uppercase font-bold tracking-wider">Cardholder</p>
                          <p className="font-semibold truncate max-w-[180px]">{cardName || 'YOUR NAME'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-stone-500 uppercase font-bold tracking-wider">Expires</p>
                          <p className="font-semibold font-mono">{cardExpiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Card Name */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-extrabold tracking-wider text-stone-400 block">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500 transition"
                      />
                    </div>

                    {/* Card Number Input */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-extrabold tracking-wider text-stone-400 block">Card Number</label>
                      <input
                        type="text"
                        placeholder="4000 1234 5678 9010"
                        maxLength={16}
                        value={cardNumber.replace(/\D/g, '')}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500 transition font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Expiry */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-extrabold tracking-wider text-stone-400 block">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500 transition font-mono"
                        />
                      </div>
                      
                      {/* CVV */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-extrabold tracking-wider text-stone-400 block">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          value={cardCvv.replace(/\D/g, '')}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-xs bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500 transition font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setClaimStep(2)}
                      className="flex-1 py-3 border border-stone-200 hover:border-stone-300 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleClaimSubmit}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 rounded-xl text-xs font-bold transition shadow-md cursor-pointer text-center"
                    >
                      Pay & Activate Claim (£{selectedPlan === 'silver' ? '9' : '29'}/mo)
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Processing Scrape & Payment */}
              {claimStep === 4 && (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <Loader2 className="h-12 w-12 text-amber-600 animate-spin" />
                  <div>
                    <h4 className="font-serif font-bold text-base text-stone-900">Activating Premium Status</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
                      {scrapeStatusText}
                    </p>
                  </div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-4">
                    Please do not close this window
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 3. Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-3">
          <p>© {new Date().getFullYear()} Cotswolds Pages. All Rights Reserved.</p>
          <div className="flex items-center justify-center gap-4 text-stone-500 font-bold">
            <Link href="/" className="hover:text-stone-300 transition">Directory Search</Link>
            <span>•</span>
            <Link href="/listings/submit" className="hover:text-stone-300 transition">Submit Business</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
