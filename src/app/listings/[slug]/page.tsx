"use client";

import React, { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
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
  tier: 'gold' | 'featured' | 'claimed' | 'basic';
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
    tier: "gold",
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
    tier: "gold",
    is_approved: true
  }
];

interface SubscriptionPlan {
  id: 'claim' | 'gold' | 'gold_social' | 'featured' | 'featured_social';
  name: string;
  description: string;
  price_monthly_gbp: number;
  features: string[];
  is_active: boolean;
}

const DEFAULT_CLAIM_PLANS: SubscriptionPlan[] = [
  {
    id: 'claim',
    name: 'Claim Listing',
    description: 'Verify ownership, link your website, and display reviews.',
    price_monthly_gbp: 20,
    features: ['✓ Verify Ownership', '✓ Link Official Website', '✓ Rating Stars & Reviews'],
    is_active: true
  },
  {
    id: 'gold',
    name: 'Gold Partner',
    description: 'The complete premium listing experience.',
    price_monthly_gbp: 50,
    features: ['✓ Gold Partner Badge', '✓ Priority Search Ranking', '✓ Full Photo Gallery', '✓ AI-Generated Details'],
    is_active: true
  },
  {
    id: 'gold_social',
    name: 'Gold & Social Package',
    description: 'All Gold features + dedicated social media promotion.',
    price_monthly_gbp: 150,
    features: ['✓ Gold Partner Badge', '✓ Priority Search Ranking', '✓ Social Media Promotion', '✓ AI-Generated Details'],
    is_active: true
  },
  {
    id: 'featured',
    name: 'Featured Partner',
    description: 'Absolute maximum visibility across Cotswolds Pages.',
    price_monthly_gbp: 100,
    features: ['✓ Featured Standout Badge', '✓ Absolute Top Ranking', '✓ Full Photo Gallery', '✓ AI-Generated Details'],
    is_active: true
  },
  {
    id: 'featured_social',
    name: 'Featured & Social Promotion',
    description: 'Absolute max visibility + premium campaigns.',
    price_monthly_gbp: 200,
    features: ['✓ Featured Standout Badge', '✓ Absolute Top Ranking', '✓ Premium Social Campaigns', '✓ AI-Generated Details'],
    is_active: true
  }
];

export default function ListingProfile() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic pricing plans
  const [pricingPlans, setPricingPlans] = useState<SubscriptionPlan[]>(DEFAULT_CLAIM_PLANS);

  // Fetch live pricing plans
  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/pricing');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPricingPlans(data);
          }
        }
      } catch (err) {
        console.warn('Using default pricing plans:', err);
      }
    }
    fetchPricing();
  }, []);

  // Claim listing flow states
  const [isClaimModalOpen, setIsClaimModalOpen] = useState<boolean>(false);
  const [claimStep, setClaimStep] = useState<number>(1);
  const [selectedPlan, setSelectedPlan] = useState<'claim' | 'gold' | 'gold_social' | 'featured' | 'featured_social'>('gold');
  const [websiteInput, setWebsiteInput] = useState<string>('');
  const [claimError, setClaimError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);

  // Helper to find selected plan object
  const activePlanObj = pricingPlans.find(p => p.id === selectedPlan) || DEFAULT_CLAIM_PLANS.find(p => p.id === selectedPlan)!;

  // Handles redirecting the user to Stripe Checkout Session
  const handleStripeCheckout = async () => {
    if (!listing) return;
    setClaimError(null);
    setCheckoutLoading(true);

    try {
      const res = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          tier: selectedPlan,
          website: websiteInput
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Server error occurred while creating checkout session.');
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL returned from payment server.');
      }
    } catch (err: any) {
      setClaimError(err.message || 'An unexpected error occurred during payment processing.');
      setCheckoutLoading(false);
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
  const isFeatured = listing.tier === 'featured';
  
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=1200&q=80"
              alt="Cotswolds Pages"
              className="w-full h-full object-cover opacity-60"
            />
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
                {isFeatured && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-600 text-white shadow-lg border border-indigo-500 animate-pulse">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Featured Partner
                  </span>
                )}
                {isGold && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-white shadow-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Gold Partner
                  </span>
                )}
                {listing.tier === 'claimed' && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Claimed Partner
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
              {(isGold || isFeatured) && listing.premium_metadata && (
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
              {(isGold || isFeatured) && listing.images && listing.images.length > 1 && (
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
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer text-center"
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
                  {(isGold || isFeatured) && listing.premium_metadata?.socialLinks && (
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
                      <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Location</p>
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
                          <span className="font-semibold text-stone-500">{day}</span>
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
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-stone-200 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl relative animate-scale-in my-8 text-stone-900 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="border-b border-stone-200/80 px-6 py-4 flex items-center justify-between bg-stone-50/80 shrink-0">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-950">
                  Claim Listing: {listing?.title}
                </h3>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5">
                  Step {claimStep} of 3 • {claimStep === 1 ? "Choose Membership Plan" : claimStep === 2 ? "Configure Website" : "Review & Secure Checkout"}
                </p>
              </div>
              
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg cursor-pointer h-8 w-8 rounded-full flex items-center justify-center hover:bg-stone-200/50 transition pressable"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {claimError && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex gap-2 items-center">
                  <span className="font-bold">Error:</span> {claimError}
                </div>
              )}

              {/* STEP 1: Select Plan */}
              {claimStep === 1 && (() => {
                const claimPlan = pricingPlans.find(p => p.id === 'claim') || { price_monthly_gbp: 20 };
                const goldPlan = pricingPlans.find(p => p.id === 'gold') || { price_monthly_gbp: 50 };
                const featuredPlan = pricingPlans.find(p => p.id === 'featured') || { price_monthly_gbp: 100 };
                const socialAddonPlan = pricingPlans.find(p => p.id === 'gold_social') || { price_monthly_gbp: 150 };
                const socialAddonDiff = Number(socialAddonPlan.price_monthly_gbp) - Number(goldPlan.price_monthly_gbp);

                // Current base tier: 'claim', 'gold', 'featured'
                const currentBase = selectedPlan.startsWith('featured') ? 'featured' : selectedPlan.startsWith('gold') ? 'gold' : 'claim';
                const hasSocial = selectedPlan.includes('social');

                const handleSelectBase = (base: 'claim' | 'gold' | 'featured') => {
                  if (base === 'claim') {
                    setSelectedPlan('claim');
                  } else if (base === 'gold') {
                    setSelectedPlan(hasSocial ? 'gold_social' : 'gold');
                  } else if (base === 'featured') {
                    setSelectedPlan(hasSocial ? 'featured_social' : 'featured');
                  }
                };

                const handleToggleSocial = (checked: boolean) => {
                  if (currentBase === 'claim') {
                    setSelectedPlan(checked ? 'gold_social' : 'claim');
                  } else if (currentBase === 'gold') {
                    setSelectedPlan(checked ? 'gold_social' : 'gold');
                  } else if (currentBase === 'featured') {
                    setSelectedPlan(checked ? 'featured_social' : 'featured');
                  }
                };

                return (
                  <div className="space-y-4">
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Select a membership tier to unlock verified badges, deep search priority, and AI-powered profile enrichment:
                    </p>

                    {/* 3 Primary Base Tiers */}
                    <div className="space-y-3">
                      {/* Tier 1: Claimed Partner */}
                      <div
                        onClick={() => handleSelectBase('claim')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          currentBase === 'claim'
                            ? 'border-emerald-600 bg-emerald-500/5 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-stone-900">Claim Partner</span>
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                                Standard
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-1">Verified owner badge, direct phone, WhatsApp & website contact buttons.</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-base font-black text-stone-900">£{claimPlan.price_monthly_gbp}</span>
                            <span className="text-[10px] text-stone-400 font-semibold block">/month</span>
                          </div>
                        </div>
                      </div>

                      {/* Tier 2: Gold Partner (Recommended) */}
                      <div
                        onClick={() => handleSelectBase('gold')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          currentBase === 'gold'
                            ? 'border-amber-500 bg-amber-500/5 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-amber-900">Gold Partner</span>
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-amber-500 text-white rounded-full">
                                ⭐ Most Popular
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-1">
                              High search rank, Gold verified badge, and automated AI deep extraction for menus, rooms & FAQs.
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-base font-black text-amber-900">£{goldPlan.price_monthly_gbp}</span>
                            <span className="text-[10px] text-stone-400 font-semibold block">/month</span>
                          </div>
                        </div>
                      </div>

                      {/* Tier 3: Featured Partner */}
                      <div
                        onClick={() => handleSelectBase('featured')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          currentBase === 'featured'
                            ? 'border-indigo-600 bg-indigo-500/5 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-indigo-950">Featured Partner</span>
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                                👑 VIP Placement
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-1">
                              Top search placement, Homepage banner spotlight, and maximum visitor reach.
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-base font-black text-indigo-950">£{featuredPlan.price_monthly_gbp}</span>
                            <span className="text-[10px] text-stone-400 font-semibold block">/month</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Optional Social Media Marketing Add-On */}
                    <div className="mt-4 p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">📢</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-950">Cotswolds Social Media Campaign</span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-indigo-200 text-indigo-800 rounded">
                              +£{socialAddonDiff > 0 ? socialAddonDiff : 100}/mo
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-600 mt-0.5">
                            Dedicated Instagram & Facebook spotlight post to 45,000+ Cotswolds visitors and foodies.
                          </p>
                        </div>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={hasSocial}
                          onChange={(e) => handleToggleSocial(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <button
                      onClick={() => setClaimStep(2)}
                      className="pressable w-full py-3 bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-xl text-xs font-bold transition shadow-md mt-4 cursor-pointer"
                    >
                      Continue with {activePlanObj?.name || 'Selected Plan'} (Total: £{activePlanObj?.price_monthly_gbp || 20}/mo)
                    </button>
                  </div>
                );
              })()}

              {/* STEP 2: Configure Website */}
              {claimStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Provide your official business website. Our AI will crawl your pages to extract house specialties, menus, rooms, and FAQs for your listing:
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
                      className="pressable flex-1 py-3 border border-stone-200 hover:border-stone-300 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
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
                      className="pressable flex-1 py-3 bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment Checkout */}
              {claimStep === 3 && (
                <div className="space-y-5">
                  {/* Order Summary Card */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                    <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400 border-b border-stone-100 pb-2">
                      Order Summary
                    </h4>
                    
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500 font-medium">Business listing</span>
                        <span className="text-stone-900 font-bold">{listing?.title}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500 font-medium">Selected Plan</span>
                        <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full border ${
                          selectedPlan.includes('featured')
                            ? 'text-indigo-800 bg-indigo-50 border-indigo-200'
                            : selectedPlan.includes('gold')
                            ? 'text-amber-800 bg-amber-50 border-amber-200'
                            : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                        }`}>
                          {activePlanObj?.name || selectedPlan}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500 font-medium">Website URL</span>
                        <span className="text-stone-900 font-medium truncate max-w-[200px]">{websiteInput}</span>
                      </div>
                      <div className="border-t border-stone-200/60 pt-2.5 flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-900">Total Subscription</span>
                        <div className="text-right">
                          <span className="text-base font-black text-stone-900">£{activePlanObj?.price_monthly_gbp ?? 20}</span>
                          <span className="text-[10px] font-bold text-stone-400"> / month</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stripe Explanation */}
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 flex gap-3 items-start text-xs">
                    <span className="text-base leading-none mt-0.5">🔒</span>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      You will be securely redirected to <strong>Stripe Checkout</strong>. Billing is monthly and can be cancelled anytime. Your AI crawl and badge status activate immediately after payment.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setClaimStep(2)}
                      disabled={checkoutLoading}
                      className="pressable flex-1 py-3 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleStripeCheckout}
                      disabled={checkoutLoading}
                      className="pressable flex-1 py-3 bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                          Redirecting to Stripe...
                        </>
                      ) : (
                        `Pay & Claim (£${activePlanObj?.price_monthly_gbp ?? 20}/mo)`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Footer */}
      <Footer theme="dark" />
    </div>
  );
}

