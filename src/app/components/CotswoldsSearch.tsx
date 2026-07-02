"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Compass, 
  Phone, 
  Globe, 
  Navigation, 
  Star,
  MessageSquare,
  AlertCircle,
  Loader2
} from 'lucide-react';

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
  county: string;
  sub_region: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  tier: 'basic' | 'silver' | 'gold';
  distance_miles?: number;
  rating?: number;
  reviews_count?: number;
  opening_hours?: any;
}

// Default coordinates for Bourton-on-the-Water (central point of the Cotswolds)
const DEFAULT_CENTER_LAT = 51.8862;
const DEFAULT_CENTER_LNG = -1.7588;

const CATEGORIES = [
  "All Categories",
  "Hotel & Accommodation",
  "Pub & Restaurant",
  "Gastropub & Inn",
  "Boutique Shop",
  "Attraction & Tour",
  "Local Business"
];

const SUB_REGIONS = [
  "All Sub-Regions",
  "Broadway",
  "Chipping Campden",
  "Stow-on-the-Wold",
  "Bourton-on-the-Water",
  "Kingham",
  "Cirencester",
  "Burford",
  "Snowshill"
];

const COUNTY_CARDS = [
  { name: 'Gloucestershire', gradient: 'from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 shadow-amber-900/10' },
  { name: 'Oxfordshire', gradient: 'from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 shadow-emerald-950/10' },
  { name: 'Warwickshire', gradient: 'from-rose-800 to-rose-950 hover:from-rose-700 hover:to-rose-905 shadow-rose-950/10' },
  { name: 'Wiltshire', gradient: 'from-slate-700 to-slate-900 hover:from-slate-650 hover:to-slate-800 shadow-slate-950/10' },
  { name: 'Worcestershire', gradient: 'from-purple-800 to-indigo-950 hover:from-purple-700 hover:to-indigo-900 shadow-purple-950/10' }
];

interface CotswoldsSearchProps {
  hideListings?: boolean;
}

export default function CotswoldsSearch({ hideListings = false }: CotswoldsSearchProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedRegion, setSelectedRegion] = useState<string>("All Sub-Regions");
  const [radius, setRadius] = useState<number>(15); // Default 15 miles radius
  
  // Custom client side filters & search toggles
  const [keyword, setKeyword] = useState<string>("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [onlyPremium, setOnlyPremium] = useState<boolean>(false);
  const [hasWhatsApp, setHasWhatsApp] = useState<boolean>(false);
  const [hasWebsite, setHasWebsite] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'proximity' | 'alphabetical' | 'newest'>("alphabetical");
  const [visibleCount, setVisibleCount] = useState<number>(9);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(9);
  }, [selectedCategory, selectedRegion, radius, debouncedKeyword, onlyPremium, hasWhatsApp, hasWebsite, sortBy]);

  // Synchronize state with URL search parameters (triggered by clicking home category/county cards)
  useEffect(() => {
    const categoryQuery = searchParams.get('category');
    const regionQuery = searchParams.get('region');
    const keywordQuery = searchParams.get('keyword');

    if (categoryQuery) {
      setSelectedCategory(categoryQuery);
    }
    if (regionQuery) {
      setSelectedRegion(regionQuery);
    }
    if (keywordQuery) {
      setKeyword(keywordQuery);
    }
  }, [searchParams]);

  // Debounce keyword typing to prevent sluggish re-renders on keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 180);
    return () => clearTimeout(timer);
  }, [keyword]);
  
  // Geolocation states
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Prefetch all listings once on mount for counts & featured listings
  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch('/api/listings');
        if (res.ok) {
          const data = await res.json();
          setAllListings(data);
        }
      } catch (err) {
        console.warn("Failed to prefetch listings: ", err);
      }
    }
    fetchAll();
  }, []);

  // Ask for user's geographical position
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocatingUser(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocatingUser(false);
      },
      (error) => {
        console.warn("Geolocation access denied or failed: ", error.message);
        setLocationError("Unable to retrieve your precise location. Using central Cotswolds coordinates instead.");
        setUserCoords({
          lat: DEFAULT_CENTER_LAT,
          lng: DEFAULT_CENTER_LNG
        });
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Helper to construct WhatsApp customer lead routing URL
  const getWhatsAppURL = (whatsappNum: string, businessName: string) => {
    // Standardize phone string into purely numbers
    const cleanNum = whatsappNum.replace(/\D/g, '');
    const defaultText = `Hi! I found "${businessName}" on the Cotswolds Local Directory and would like to ask about your availability and services.`;
    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(defaultText)}`;
  };

  // Main fetch function
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (selectedCategory && selectedCategory !== "All Categories") {
        params.append("category", selectedCategory);
      }
      
      if (selectedRegion && selectedRegion !== "All Sub-Regions") {
        params.append("region", selectedRegion);
      }

      // If user has shared location OR we are falling back to default center
      if (userCoords) {
        params.append("lat", userCoords.lat.toString());
        params.append("lng", userCoords.lng.toString());
        params.append("radius", radius.toString());
      }

      const res = await fetch(`/api/listings?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Unable to fetch business directory listings. Please try again.");
      }
      const data = await res.json();
      setListings(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading listings.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedRegion, radius, userCoords]);

  // Trigger search with delay debouncing on filter updates
  useEffect(() => {
    if (hideListings) return;
    const delayDebounce = setTimeout(() => {
      fetchListings();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [fetchListings, hideListings]);

  // Handle Search Submission (redirects to search route if hideListings is active)
  const handleSearchSubmit = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (hideListings) {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (selectedCategory && selectedCategory !== "All Categories") params.set('category', selectedCategory);
      if (selectedRegion && selectedRegion !== "All Sub-Regions") params.set('region', selectedRegion);
      router.push(`/search?${params.toString()}`);
    } else {
      fetchListings();
    }
  };

  // Client side keyword search, checks, and sorting calculations
  const filteredListings = listings.filter((item) => {
    if (debouncedKeyword.trim()) {
      const q = debouncedKeyword.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q) || false;
      const matchCat = item.category?.toLowerCase().includes(q) || false;
      const matchRegion = item.sub_region?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchCat && !matchRegion) {
        return false;
      }
    }
    
    if (onlyPremium && item.tier === 'basic') {
      return false;
    }
    if (hasWhatsApp && !item.whatsapp && !item.phone) {
      return false;
    }
    if (hasWebsite && !item.website) {
      return false;
    }
    return true;
  });

  const sortedListings = [...filteredListings];
  const tierOrder: Record<string, number> = { gold: 1, silver: 2, basic: 3 };
  sortedListings.sort((a, b) => {
    const tierA = tierOrder[a.tier] || 99;
    const tierB = tierOrder[b.tier] || 99;
    if (tierA !== tierB) {
      return tierA - tierB;
    }
    
    if (sortBy === 'proximity' && a.distance_miles !== undefined && b.distance_miles !== undefined) {
      return a.distance_miles - b.distance_miles;
    } else if (sortBy === 'newest') {
      return b.id.localeCompare(a.id);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Sleek Floating Search Pill */}
      <div className="w-full bg-white rounded-2xl md:rounded-full border border-stone-200 shadow-xl p-3 md:p-2 mb-10 flex flex-col md:flex-row items-center gap-2">
        {/* Keyword Search Input */}
        <div className="w-full md:flex-1 flex items-center gap-2 px-3 py-2 md:py-0 border-b md:border-b-0 md:border-r border-stone-105">
          <Search className="h-5 w-5 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Search hotels, pubs, shops..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full text-sm bg-transparent text-stone-900 placeholder-stone-400 focus:outline-hidden"
          />
        </div>

        {/* Category Dropdown Selector */}
        <div className="w-full md:w-56 flex items-center gap-2 px-3 py-2 md:py-0 border-b md:border-b-0 md:border-r border-stone-105">
          <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450 shrink-0">In</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-sm bg-transparent text-stone-850 focus:outline-hidden cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="text-stone-900">{cat}</option>
            ))}
          </select>
        </div>

        {/* Region Dropdown Selector */}
        <div className="w-full md:w-56 flex items-center gap-2 px-3 py-2 md:py-0 border-b md:border-b-0 border-stone-105 md:mr-2">
          <label className="text-[10px] uppercase font-bold tracking-wider text-stone-450 shrink-0">Near</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full text-sm bg-transparent text-stone-850 focus:outline-hidden cursor-pointer"
          >
            {SUB_REGIONS.map(reg => (
              <option key={reg} value={reg} className="text-stone-900">{reg}</option>
            ))}
          </select>
        </div>

        {/* CTA Button Actions */}
        <div className="w-full md:w-auto flex items-center gap-2 justify-end mt-2 md:mt-0">
          {/* Advanced Filter Drawer Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border ${
              showFilters || onlyPremium || hasWhatsApp || hasWebsite || userCoords
                ? 'bg-amber-50 border-amber-250 text-amber-800 shadow-xs'
                : 'border-stone-200 hover:bg-stone-50 text-stone-605'
            }`}
          >
            Filters
            <span className="inline-block text-[10px] opacity-75">▼</span>
          </button>

          {/* Search Trigger Button */}
          <button
            onClick={handleSearchSubmit}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-full text-xs font-bold shadow-md transition shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
        </div>
      </div>

      {/* Advanced Filters Expandable Drawer (Slide Down) */}
      {showFilters && (
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 mb-10 shadow-lg border border-stone-800">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Advanced Filters & Settings</h4>
            
            {/* GPS Share Location Trigger */}
            <button
              onClick={requestLocation}
              disabled={locatingUser}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                userCoords
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              {locatingUser ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                  Locating...
                </>
              ) : (
                <>
                  <Navigation className="h-3.5 w-3.5" />
                  {userCoords ? "GPS Shared" : "Share GPS Location"}
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: Spatial Proximity Search */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Proximity Radius Limit</span>
                <span className="text-xs font-bold text-amber-500">{radius} miles</span>
              </div>
              
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                disabled={!userCoords}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-30 disabled:cursor-not-allowed"
              />
              
              <p className="text-[10px] text-stone-500 leading-normal">
                {!userCoords 
                  ? "🔒 Share GPS location above to filter listings by radial mileage."
                  : `Filtering items within ${radius} miles of your location.`}
              </p>
            </div>

            {/* Column 2: Specific Checkbox Filters */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-0.5">Quick Checks</span>
              
              <label className="flex items-center gap-2.5 text-xs text-stone-300 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyPremium}
                  onChange={(e) => setOnlyPremium(e.target.checked)}
                  className="rounded border-stone-700 bg-stone-850 text-amber-500 focus:ring-amber-500 cursor-pointer h-4 w-4"
                />
                Show Premium Claims Only (Gold & Silver)
              </label>

              <label className="flex items-center gap-2.5 text-xs text-stone-300 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasWhatsApp}
                  onChange={(e) => setHasWhatsApp(e.target.checked)}
                  className="rounded border-stone-700 bg-stone-850 text-amber-500 focus:ring-amber-500 cursor-pointer h-4 w-4"
                />
                Direct WhatsApp Contact Enabled
              </label>

              <label className="flex items-center gap-2.5 text-xs text-stone-300 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasWebsite}
                  onChange={(e) => setHasWebsite(e.target.checked)}
                  className="rounded border-stone-700 bg-stone-850 text-amber-500 focus:ring-amber-500 cursor-pointer h-4 w-4"
                />
                Has Website Link Available
              </label>
            </div>

            {/* Column 3: Sorting Options */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Sort Listings</span>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-stone-800 text-stone-200 border border-stone-700 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer w-full"
              >
                <option value="alphabetical" className="text-stone-900">Alphabetical (A - Z)</option>
                <option value="proximity" disabled={!userCoords} className="text-stone-900">Proximity (Requires GPS)</option>
                <option value="newest" className="text-stone-900">Newest Added First</option>
              </select>
              
              <p className="text-[10px] text-stone-500 leading-normal">
                {!userCoords && sortBy === 'proximity' 
                  ? "Proximity sorting requires sharing location coordinates."
                  : "Listings are sorted inside each membership tier (Gold Partner priority)."}
              </p>
            </div>

          </div>

          {/* Location status overlay inside filters */}
          {(locationError || (userCoords && !locationError)) && (
            <div className="mt-6 border-t border-stone-800 pt-4 text-xs">
              {locationError && <span className="text-amber-400 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {locationError}</span>}
              {userCoords && !locationError && <span className="text-emerald-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> GPS Coordinates active. Sorting and radial mileage filtering available.</span>}
            </div>
          )}
        </div>
      )}

      {!hideListings && (
        <>
          {/* 2. Featured Claimed Listings Carousel */}
          {(() => {
            const featuredListings = (allListings.length ? allListings : listings).filter(
              (item) => item.tier === 'gold' || item.tier === 'silver'
            );

            if (featuredListings.length === 0) return null;

            return (
              <div className="mb-10 animate-fade-in">
                <div className="mb-5">
                  <h3 className="text-xl font-bold tracking-tight text-stone-900 font-serif flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500 fill-current animate-pulse" />
                    Featured Claimed Listings
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Explore hand-verified premium venues and trusted local partners.
                  </p>
                </div>

                {/* Horizontal snaps row */}
                <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-stone-50">
                  {featuredListings.map((item) => {
                    const isGold = item.tier === 'gold';
                    const whatsappContact = item.whatsapp || item.phone;
                    
                    return (
                      <div
                        key={`featured-${item.id}`}
                        className={`snap-start shrink-0 w-72 sm:w-80 bg-white rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md ${
                          isGold 
                            ? 'border-2 border-amber-500 shadow-md ring-4 ring-amber-500/5' 
                            : 'border border-stone-200 shadow-xs'
                        }`}
                      >
                        {/* Cover image */}
                        <Link href={`/listings/${item.slug}`} className="relative block aspect-video w-full bg-stone-100 overflow-hidden cursor-pointer hover:opacity-95">
                          {item.images && item.images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                              <MapPin className="h-8 w-8 stroke-1" />
                            </div>
                          )}

                          {isGold && (
                            <div className="absolute top-3 left-3 flex gap-1">
                              <span className="bg-amber-500 text-stone-950 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                                Gold
                              </span>
                            </div>
                          )}
                        </Link>

                        {/* Text card info */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 block mb-1">{item.category}</span>
                            <h4 className="font-serif font-bold text-sm text-stone-900 hover:text-amber-700 transition">
                              <Link href={`/listings/${item.slug}`}>{item.title}</Link>
                            </h4>
                            <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2.5">
                            <span className="text-[10px] text-stone-400 font-medium flex items-center gap-0.5 truncate">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{item.sub_region || 'Cotswolds'}</span>
                            </span>
                            {whatsappContact ? (
                              <a
                                href={getWhatsAppURL(whatsappContact, item.title)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-505 active:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                <MessageSquare className="h-3.5 w-3.5 fill-current" />
                                WhatsApp
                              </a>
                            ) : item.website ? (
                              <a
                                href={item.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 border border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50 active:bg-stone-100 rounded-lg text-[10px] font-bold transition shrink-0"
                              >
                                Website
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 3. Explore by County grid select */}
          {(() => {
            const getCountyCount = (countyName: string) => {
              const matches = allListings.length ? allListings : listings;
              return matches.filter((item) => item.county?.toLowerCase() === countyName.toLowerCase()).length;
            };

            const handleCountyClick = (countyName: string) => {
              if (selectedRegion.toLowerCase() === countyName.toLowerCase()) {
                setSelectedRegion('All Sub-Regions');
              } else {
                setSelectedRegion(countyName);
              }

              // Smooth scroll to directory results list
              setTimeout(() => {
                const el = document.getElementById('directory-results');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 150);
            };

            return (
              <div className="mb-12 border-t border-stone-200 pt-10">
                <div className="mb-6">
                  <h3 className="text-xl font-bold tracking-tight text-stone-900 font-serif">
                    Explore by County
                  </h3>
                  <p className="text-xs text-stone-505 mt-0.5">
                    Select a local county to search approved listings and historic villages.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {COUNTY_CARDS.map((county) => {
                    const count = getCountyCount(county.name);
                    const isActive = selectedRegion.toLowerCase() === county.name.toLowerCase();

                    return (
                      <button
                        key={county.name}
                        onClick={() => handleCountyClick(county.name)}
                        className={`relative p-5 rounded-2xl overflow-hidden text-left h-36 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer group bg-gradient-to-br ${county.gradient} text-white ${
                          isActive ? 'ring-4 ring-amber-500 ring-offset-2 scale-[1.01]' : ''
                        }`}
                      >
                        {/* Decorative background character */}
                        <span className="absolute -right-2 -bottom-6 text-8xl font-black text-white/5 font-serif select-none group-hover:scale-110 transition-transform duration-500">
                          {county.name[0]}
                        </span>

                        <span className="bg-white/15 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider w-fit">
                          {county.name === 'Gloucestershire' ? 'Glos' : county.name === 'Oxfordshire' ? 'Oxon' : county.name === 'Warwickshire' ? 'Warks' : county.name === 'Worcestershire' ? 'Worcs' : 'Wilts'}
                        </span>

                        <div>
                          <h4 className="font-serif font-bold text-base leading-tight group-hover:text-amber-300 transition-colors">
                            {county.name}
                          </h4>
                          <p className="text-[11px] text-white/70 mt-1">
                            {count} {count === 1 ? 'Listing' : 'Listings'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 4. Main Results Section Wrapper */}
          <div id="directory-results" className="scroll-mt-10 border-t border-stone-200 pt-10">
            {/* 2. Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
                <p className="text-sm text-stone-500 font-medium">Searching directory listings...</p>
              </div>
            )}

            {/* 3. Error State */}
            {error && !loading && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 max-w-xl mx-auto flex gap-3 items-center">
                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* 4. Empty State */}
            {!loading && !error && sortedListings.length === 0 && (
              <div className="text-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-2xl max-w-xl mx-auto">
                <Compass className="h-12 w-12 text-stone-400 mx-auto mb-3" />
                <h3 className="text-lg font-serif font-semibold text-stone-900">No Listings Found</h3>
                <p className="text-sm text-stone-500 mt-2 max-w-xs mx-auto">
                  Try adjusting your search filters or broadening your radial mileage limits.
                </p>
              </div>
            )}

            {/* 5. Responsive Multi-Column Layout */}
            {!loading && !error && sortedListings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedListings.slice(0, visibleCount).map((item) => {
                  const isGold = item.tier === 'gold';
                  const whatsappContact = item.whatsapp || item.phone;
                  
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-355 transform hover:-translate-y-1.5 ${
                        isGold 
                          ? 'border-2 border-amber-500 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/15 ring-4 ring-amber-500/5' 
                          : 'border border-stone-200 hover:border-stone-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Image & Card Head */}
                      <Link href={`/listings/${item.slug}`} className="relative block aspect-video w-full bg-stone-100 overflow-hidden cursor-pointer hover:opacity-95">
                        {item.images && item.images.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                            <MapPin className="h-10 w-10 stroke-1" />
                          </div>
                        )}

                        <div className="absolute top-3.5 left-3.5 flex gap-1.5">
                          <span className="bg-amber-500 text-stone-950 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                            {isGold ? 'Gold Partner' : 'Basic Member'}
                          </span>
                        </div>
                      </Link>

                      {/* Info & CTA details */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-705 block">{item.category}</span>
                            <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-0.5">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-28">{item.sub_region || 'Cotswolds'}</span>
                            </span>
                          </div>

                          <h3 className="text-md font-serif font-black text-stone-900 mt-2 hover:text-amber-700 transition">
                            <Link href={`/listings/${item.slug}`}>{item.title}</Link>
                          </h3>

                          {item.rating && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <div className="flex text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < Math.floor(item.rating || 0) ? 'fill-current' : 'opacity-20'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] font-bold text-stone-500">({item.rating})</span>
                            </div>
                          )}

                          <p className="text-xs text-stone-550 mt-2 line-clamp-3 leading-relaxed">
                            {item.description || "Local business listings in the Cotswolds sub-regions."}
                          </p>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-stone-100/60 flex flex-col gap-2">
                          <div className="flex flex-col gap-1 text-[10px] text-stone-400 font-medium">
                            <span className="truncate">{item.address || `${item.sub_region}, Cotswolds`}</span>
                            {item.phone && <span>Phone: {item.phone}</span>}
                          </div>

                          <div className="flex gap-2.5 mt-2">
                            <Link
                              href={`/listings/${item.slug}`}
                              className="flex-1 py-2 bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-lg text-xs font-bold transition text-center"
                            >
                              View Profile
                            </Link>

                            {whatsappContact ? (
                              <a
                                href={getWhatsAppURL(whatsappContact, item.title)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-505 active:bg-emerald-700 text-white rounded-lg text-xs font-bold transition text-center cursor-pointer"
                              >
                                <MessageSquare className="h-4 w-4 fill-current" />
                                WhatsApp
                              </a>
                            ) : item.website ? (
                              <a
                                href={item.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50 active:bg-stone-100 rounded-lg text-xs font-semibold transition text-center"
                              >
                                <Globe className="h-3.5 w-3.5" />
                                Website
                              </a>
                            ) : item.phone ? (
                              <a
                                href={`tel:${item.phone.replace(/\s+/g, '')}`}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50 active:bg-stone-100 rounded-lg text-xs font-semibold transition text-center"
                              >
                                <Phone className="h-3.5 w-3.5" />
                                Call
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && !error && sortedListings.length > visibleCount && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 9)}
                  className="px-8 py-3.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg cursor-pointer"
                >
                  Load More Listings
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
