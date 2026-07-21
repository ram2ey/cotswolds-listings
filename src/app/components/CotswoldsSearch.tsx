"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Loader2,
  ChevronDown
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
  town: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  tier: 'basic' | 'gold' | 'featured' | 'claimed';
  distance_miles?: number;
  rating?: number;
  reviews_count?: number;
  opening_hours?: any;
}

// Default coordinates for Bourton-on-the-Water (central point of the Cotswolds)
const DEFAULT_CENTER_LAT = 51.8862;
const DEFAULT_CENTER_LNG = -1.7588;

const CATEGORIES = [
  "Choose Category",
  "Construction & Home Maintenance",
  "Health & Beauty",
  "Professional Services",
  "Car & Automotive",
  "Hotels & Motels",
  "Restaurants & Cafés"
];

const TOWNS = [
  "Select Town",
  "Broadway",
  "Chipping Campden",
  "Stow-on-the-Wold",
  "Bourton-on-the-Water",
  "Kingham",
  "Cirencester",
  "Burford",
  "Snowshill"
];

const TOWN_CARDS = [
  { name: 'Broadway', img: '/broadway.jpeg', gradient: 'from-amber-800/80 to-amber-950/90' },
  { name: 'Chipping Campden', img: '/chipping-campden.jpeg', gradient: 'from-emerald-800/80 to-emerald-950/90' },
  { name: 'Stow-on-the-Wold', img: '/stow-on-the-wold.jpeg', gradient: 'from-rose-800/80 to-rose-950/90' },
  { name: 'Bourton-on-the-Water', img: '/bourton-on-the-water.jpeg', gradient: 'from-slate-700/80 to-slate-900/90' },
  { name: 'Cirencester', img: '/cirencester.jpeg', gradient: 'from-purple-800/80 to-indigo-950/90' }
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
  const [selectedCategory, setSelectedCategory] = useState<string>("Choose Category");
  const [selectedRegion, setSelectedRegion] = useState<string>("Select Town");
  const [radius, setRadius] = useState<number>(15); // Default 15 miles radius
  
  // Custom client side filters & search toggles
  const [keyword, setKeyword] = useState<string>("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [onlyPremium, setOnlyPremium] = useState<boolean>(false);
  const [hasWebsite, setHasWebsite] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'proximity' | 'alphabetical' | 'newest'>("alphabetical");
  const [visibleCount, setVisibleCount] = useState<number>(9);

  // Dynamic list of towns based on active database listings
  const dynamicTowns = useMemo(() => {
    if (!allListings || allListings.length === 0) {
      return TOWNS;
    }
    const unique = new Set<string>();
    allListings.forEach((item) => {
      if (item.town && item.town.trim()) {
        const normalized = item.town.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        unique.add(normalized);
      }
    });
    return ["Select Town", ...Array.from(unique).sort()];
  }, [allListings]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(9);
  }, [selectedCategory, selectedRegion, radius, debouncedKeyword, onlyPremium, hasWebsite, sortBy]);

  // Synchronize state with URL search parameters (triggered by clicking home category/town cards)
  useEffect(() => {
    const categoryQuery = searchParams.get('category');
    const regionQuery = searchParams.get('town') || searchParams.get('region');
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

  // Main fetch function
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (selectedCategory && selectedCategory !== "Choose Category") {
        params.append("category", selectedCategory);
      }
      
      if (selectedRegion && selectedRegion !== "Select Town") {
        params.append("town", selectedRegion);
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
      if (selectedCategory && selectedCategory !== "Choose Category") params.set('category', selectedCategory);
      if (selectedRegion && selectedRegion !== "Select Town") params.set('town', selectedRegion);
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
      const matchRegion = item.town?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchCat && !matchRegion) {
        return false;
      }
    }
    
    if (onlyPremium && item.tier === 'basic') {
      return false;
    }
    if (hasWebsite && !item.website) {
      return false;
    }
    return true;
  });

  const sortedListings = [...filteredListings];
  const tierOrder: Record<string, number> = { featured: 1, gold: 2, claimed: 3, basic: 4 };
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
            placeholder="What are you looking for?"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full text-sm bg-transparent text-stone-900 placeholder-stone-400 focus:outline-hidden"
          />
        </div>

        {/* Category Dropdown Selector */}
        <div className="relative w-full md:w-56 flex items-center gap-2 px-3 py-2 md:py-0 border-b md:border-b-0 md:border-r border-stone-200">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-sm bg-transparent text-stone-850 focus:outline-hidden cursor-pointer appearance-none pr-8"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="text-stone-900">{cat}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 h-4 w-4 text-stone-400 pointer-events-none" />
        </div>

        {/* Town Dropdown Selector */}
        <div className="relative w-full md:w-56 flex items-center gap-2 px-3 py-2 md:py-0 border-b md:border-b-0 border-stone-250 md:mr-2">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full text-sm bg-transparent text-stone-850 focus:outline-hidden cursor-pointer appearance-none pr-8"
          >
            {dynamicTowns.map(reg => (
              <option key={reg} value={reg} className="text-stone-900">{reg}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 h-4 w-4 text-stone-400 pointer-events-none" />
        </div>

        {/* CTA Button Actions */}
        <div className="w-full md:w-auto flex items-center gap-2 justify-end mt-2 md:mt-0">
          {/* Advanced Filter Drawer Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border ${
              showFilters || onlyPremium || hasWebsite || userCoords
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
                Show Premium Claims Only (Gold & Featured)
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
              (item) => item.tier === 'gold' || item.tier === 'featured'
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
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src="https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=600&q=80"
                              alt="Cotswolds Pages"
                              className="object-cover w-full h-full opacity-80"
                            />
                          )}

                          {item.tier === 'featured' ? (
                            <div className="absolute top-3 left-3 flex gap-1">
                              <span className="bg-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                                Featured
                              </span>
                            </div>
                          ) : isGold ? (
                            <div className="absolute top-3 left-3 flex gap-1">
                              <span className="bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                                Gold
                              </span>
                            </div>
                          ) : item.tier === 'claimed' ? (
                            <div className="absolute top-3 left-3 flex gap-1">
                              <span className="bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                                Claimed
                              </span>
                            </div>
                          ) : null}
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
                              <span className="truncate">{item.town || 'Cotswolds'}</span>
                            </span>
                            <Link
                              href={`/listings/${item.slug}`}
                              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-[10px] font-bold transition shrink-0"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
           })()}

          {/* 4. Main Results Section Wrapper */}
          <div id="directory-results" className="scroll-mt-10 border-t border-stone-200 pt-10">
            {selectedRegion && selectedRegion !== "Select Town" && (
              <div className="mb-6 flex items-center gap-1.5 text-xs text-stone-500">
                <button
                  onClick={() => {
                    setSelectedRegion("Select Town");
                    if (typeof window !== 'undefined') {
                      const params = new URLSearchParams(window.location.search);
                      params.delete('town');
                      params.delete('region');
                      router.push(`/search?${params.toString()}`);
                    }
                  }}
                  className="hover:text-stone-900 transition-colors font-medium underline cursor-pointer"
                >
                  Select Town
                </button>
                <span>&gt;</span>
                <span className="font-semibold text-stone-900">{selectedRegion}</span>
              </div>
            )}
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
                      className={`bg-white rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-fade-in-up ${
                        isGold 
                          ? 'border-2 border-amber-500 shadow-lg shadow-amber-500/5 hover:shadow-amber-500/15 ring-4 ring-amber-500/5' 
                          : 'border border-stone-200 hover:border-stone-300'
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
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src="https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=600&q=80"
                            alt="Cotswolds Pages"
                            className="object-cover w-full h-full opacity-80 hover:scale-105 transition-transform duration-500"
                          />
                        )}

                        <div className="absolute top-3.5 left-3.5 flex gap-1.5">
                          {item.tier === 'featured' ? (
                            <span className="bg-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                              Featured Partner
                            </span>
                          ) : isGold ? (
                            <span className="bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                              Gold Partner
                            </span>
                          ) : item.tier === 'claimed' ? (
                            <span className="bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                              Claimed
                            </span>
                          ) : null}
                        </div>
                      </Link>

                      {/* Info & CTA details */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-705 block">{item.category}</span>
                            <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-0.5">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-28">{item.town || 'Cotswolds'}</span>
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

                          <p className="text-xs text-stone-500 mt-2 line-clamp-3 leading-relaxed">
                            {item.description || "Local business listings in the Cotswolds towns."}
                          </p>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-stone-100/60 flex flex-col gap-2">
                          <div className="flex flex-col gap-1 text-[10px] text-stone-400 font-medium">
                            <span className="truncate">{item.address || `${item.town}, Cotswolds`}</span>
                            {item.phone && <span>Phone: {item.phone}</span>}
                          </div>

                          <div className="flex gap-2.5 mt-2">
                            <Link
                              href={`/listings/${item.slug}`}
                              className="w-full py-2.5 bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white rounded-lg text-xs font-bold transition text-center"
                            >
                              View Profile
                            </Link>
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
