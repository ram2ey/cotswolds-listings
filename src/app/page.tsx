import CotswoldsSearch from "./components/CotswoldsSearch";
import Navbar from "./components/Navbar";
import { PlusCircle, Star, MapPin, Hotel, Utensils, Compass, HelpCircle, ShieldCheck, Zap, Wrench, Sparkles, Briefcase, Car, Layers, Heart } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

// Fetch live Gold Partner featured listings
async function getFeaturedListings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-url-here')) {
    // Return mock gold listings if offline
    return [
      {
        id: "mock-1",
        title: "Cotswolds Builders Ltd",
        slug: "cotswolds-builders-ltd-broadway",
        description: "Professional local building contractors offering roofing, carpentry, extensions, and complete home maintenance services.",
        category: "Construction & Home Maintenance",
        address: "High St, Broadway",
        phone: "+44 1386 852255",
        rating: 4.8,
        images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"]
      },
      {
        id: "mock-2",
        title: "Cotswold Wellness Spa",
        slug: "cotswold-wellness-spa-kingham",
        description: "Luxury health and beauty treatments, hair styling, skin clinics, massages, and holistic therapy spa in the heart of Kingham.",
        category: "Health & Beauty",
        address: "Church St, Kingham",
        phone: "+44 1608 658389",
        rating: 4.7,
        images: ["https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80"]
      },
      {
        id: "mock-3",
        title: "Broadway Hotel & Suites",
        slug: "broadway-hotel-suites-broadway",
        description: "Beautiful boutique hotel offering clean suites, scenic gardens, and high-quality room service for visitors and tourists.",
        category: "Hotels & Motels",
        address: "Digbeth St, Broadway",
        phone: "+44 1451 870048",
        rating: 4.6,
        images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"]
      }
    ];
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/listings?tier=eq.gold&is_approved=eq.true&select=*`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`
      },
      next: { revalidate: 30 }
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data.slice(0, 3); // Limit to top 3 featured partners for the template
  } catch (error) {
    console.error("Error loading featured listings, using fallbacks:", error);
    return [];
  }
}

function ShopIcon() {
  return (
    <svg className="w-20 h-20 text-stone-950 mb-6 shrink-0" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {/* Shop body */}
      <rect x="24" y="46" width="52" height="34" rx="3" />
      <rect x="44" y="58" width="14" height="22" rx="1" />
      <rect x="31" y="55" width="8" height="8" rx="1" />
      {/* Awning */}
      <path d="M19 46h62l-6-15H25l-6 15z" />
      <path d="M19 46c2.5 3.5 7.5 3.5 10 0s7.5 3.5 10 0s7.5 3.5 10 0s7.5 3.5 10 0s7.5 3.5 10 0s7.5 3.5 10 0" />
      {/* Location Pin */}
      <path d="M72 12c-5.5 0-10 4.5-10 10 0 7 10 16 10 16s10-9 10-16c0-5.5-4.5-10-10-10z" fill="white" />
      <circle cx="72" cy="22" r="3" fill="currentColor" />
    </svg>
  );
}

function SearchSlidersIcon() {
  return (
    <svg className="w-20 h-20 text-stone-950 mb-6 shrink-0" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {/* Magnifying Glass */}
      <circle cx="48" cy="45" r="24" />
      <line x1="65" y1="62" x2="82" y2="79" strokeWidth="5.5" />
      {/* Sliders */}
      <line x1="34" y1="36" x2="62" y2="36" />
      <circle cx="40" cy="36" r="3.5" fill="currentColor" />
      <line x1="34" y1="45" x2="62" y2="45" />
      <circle cx="56" cy="45" r="3.5" fill="currentColor" />
      <line x1="34" y1="54" x2="62" y2="54" />
      <circle cx="46" cy="54" r="3.5" fill="currentColor" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg className="w-20 h-20 text-stone-950 mb-6 shrink-0" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {/* Handshake line art */}
      <path d="M35 55l-10-10c-4-4-4-10 0-14s10-4 14 0l10 10" />
      <path d="M65 45L50 30c-4-4-10-4-14 0s-4 10 0 14l10 10" />
      <path d="M42 42c2-2 5-2 7 0l8 8" />
      <path d="M33 51c2-2 5-2 7 0l12 12" />
      {/* Love heart */}
      <path d="M72 16c-3-3-7-3-10 0s-3 7 0 10l10 10 10-10c3-3 3-7 0-10s-7-3-10 0z" fill="currentColor" />
    </svg>
  );
}

export default async function Home() {
  const featured = await getFeaturedListings();

  const categories = [
    { name: "Construction & Home Maintenance", icon: Wrench, desc: "Plumbers, carpenters, builders & tradesmen", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80" },
    { name: "Health & Beauty", icon: Sparkles, desc: "Salons, wellness spas & local medical care", img: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=500&q=80" },
    { name: "Professional Services", icon: Briefcase, desc: "Accountants, lawyers & digital consultants", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=80" },
    { name: "Car & Automotive", icon: Car, desc: "Mechanics, body shops, dealers & servicing", img: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=500&q=80" },
    { name: "Hotels & Motels", icon: Hotel, desc: "Verified guest houses, stays & motels", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80" },
    { name: "Restaurants & Cafés", icon: Utensils, desc: "Local restaurants, cafes & bakeries", img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=500&q=80" }
  ];

  const locations = [
    { name: 'Broadway', desc: 'Gateway views & Broadway Tower', img: 'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=500&q=80' },
    { name: 'Bourton-on-the-Water', desc: 'Little Venice of the Cotswolds', img: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=500&q=80' },
    { name: 'Stow-on-the-Wold', desc: 'Historic market squares & portals', img: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=500&q=80' },
    { name: 'Burford', desc: 'Iconic sloping streets & old bridges', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=500&q=80' },
    { name: 'Cirencester', desc: 'Roman capital & historic markets', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 font-sans scroll-smooth">
      {/* 1. Header/Navigation */}
      <Navbar />

      {/* 2. Hero Section (No search bar, no CTA buttons) */}
      <section 
        className="relative overflow-hidden bg-stone-950 text-white min-h-[380px] flex flex-col justify-center py-16 border-b border-amber-500/20 bg-cover bg-center"
        style={{ backgroundImage: `url('/hero-bridge.jpg')` }}
      >
        <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-[1px]" />
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-serif text-white leading-tight">
              All Cotswolds - <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">All In One Place</span>
            </h1>
            <p className="mt-4 text-stone-200 leading-relaxed font-normal max-w-xl text-sm sm:text-base opacity-95">
              Your fast-track to the best local businesses. We bring top-rated services, shops, and restaurants together to make your search quick and effortless.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Directory Search Console Bar (Placed right under Hero) */}
      <section id="search" className="bg-stone-50 py-8 border-b border-stone-200 scroll-mt-6">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="text-center py-20 bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
              <span className="inline-block h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-stone-505 mt-2">Loading search console...</p>
            </div>
          }>
            <CotswoldsSearch hideListings={true} />
          </Suspense>
        </div>
      </section>

      {/* 3. Featured Listings Section (Gold Partners) */}
      {featured && featured.length > 0 && (
        <section id="featured" className="py-16 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Featured Listings</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">Discover Some of Our Best Listings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.map((item: any) => (
                <div 
                  key={item.id} 
                  className="bg-stone-50 rounded-2xl overflow-hidden border border-stone-200/80 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <Link href={`/listings/${item.slug}`} className="relative block aspect-video w-full bg-stone-200">
                    {item.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={item.images[0]} 
                        alt={item.title} 
                        className="object-cover w-full h-full hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src="https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=600&q=80" 
                        alt="Cotswolds Pages" 
                        className="object-cover w-full h-full opacity-80 hover:scale-102 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-amber-500 text-stone-950 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                        Featured
                      </span>
                      <span className="bg-stone-900/90 text-amber-400 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                        Gold
                      </span>
                    </div>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 block mb-1.5">{item.category}</span>
                      <h3 className="text-md font-bold font-serif text-stone-950 hover:text-amber-700 transition">
                        <Link href={`/listings/${item.slug}`}>{item.title}</Link>
                      </h3>
                      <p className="text-xs text-stone-505 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200/60 flex flex-col gap-1.5 text-[10px] text-stone-400 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{item.address || `${item.town}, Cotswolds`}</span>
                      </span>
                      {item.phone && (
                        <span className="flex items-center gap-1 text-stone-605">
                          <PlusCircle className="h-3.5 w-3.5 rotate-45 text-stone-400 shrink-0" />
                          <span>{item.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Explore Popular Categories */}
      <section className="py-16 bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Tailored Search</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">Explore Popular Categories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/search?category=${encodeURIComponent(cat.name)}`}
                className="relative group overflow-hidden rounded-2xl aspect-[4/3] flex flex-col justify-end p-6 text-white shadow-xs hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={cat.img} 
                  alt={cat.name}
                  className="absolute inset-0 object-cover w-full h-full group-hover:scale-103 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent group-hover:via-stone-950/35 transition-all" />
                <div className="relative z-10">
                  <h3 className="font-bold text-md font-serif group-hover:text-amber-400 transition">{cat.name}</h3>
                  <p className="text-[10px] text-stone-300 mt-1 leading-normal">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Explore Popular Locations */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Cotswold Villages</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">Explore Popular Locations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <Link
                key={loc.name}
                href={`/search?region=${encodeURIComponent(loc.name)}`}
                className="relative group overflow-hidden rounded-2xl aspect-[4/3] flex flex-col justify-end p-6 text-white shadow-xs hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={loc.img} 
                  alt={loc.name}
                  className="absolute inset-0 object-cover w-full h-full group-hover:scale-103 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent group-hover:via-stone-950/35 transition-all" />
                <div className="relative z-10">
                  <h3 className="font-bold text-md font-serif group-hover:text-amber-400 transition">{loc.name}</h3>
                  <p className="text-[10px] text-stone-300 mt-1 leading-normal">{loc.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* 7. How it Works Section */}
      <section id="how-it-works" className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="flex justify-center mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-light.jpg"
                alt="Cotswolds Pages"
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-stone-850 text-base font-bold leading-relaxed mb-3 max-w-xl mx-auto">
              Cotswolds Pages is a comprehensive Directory to help you find Local Business.
            </p>
            <p className="text-stone-505 text-xs leading-relaxed max-w-xl mx-auto">
              An intuitive Directory that aims to connect local residents and visitors to local services in the area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center flex flex-col items-center">
              <ShopIcon />
              <h3 className="text-sm font-bold text-stone-950 mb-2">All Cotswolds - All In One Place</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed pr-2">
                Your fast-track to the best local businesses. We bring top-rated services, shops, and restaurants together to make your search quick and effortless.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center flex flex-col items-center">
              <SearchSlidersIcon />
              <h3 className="text-sm font-bold text-stone-950 mb-2">Exploring the Cotswolds Made Easy</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed pr-2">
                We have made it easier for you to explore businesses in your community.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center flex flex-col items-center">
              <SupportIcon />
              <h3 className="text-sm font-bold text-stone-950 mb-2">Supporting Local Businesses</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed pr-2">
                Whether you’re a new startup or an established company, our platform helps you stand out. Boosting your visibility, showcasing your offerings and reaching new customers Online and Off-line
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call to Action (CTA) Section */}
      <section className="py-16 bg-stone-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px]" />
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white leading-tight">
            Cotswolds Pages is the best way to find & discover great local businesses
          </h2>
          <p className="text-stone-300 text-xs mt-4 max-w-xl mx-auto leading-relaxed">
            Verify ownership of your business listing to gain priority rankings, unlock photo galleries, add custom FAQs, and start getting direct customer leads.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2">
            <Link
              href="/listings/submit"
              className="px-8 py-3.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-lg hover:bg-amber-600 transition"
            >
              Claim Your Free Listing
            </Link>
            <span className="text-[10px] text-stone-400">and get started in minutes</span>
          </div>
        </div>
      </section>

      {/* 9. Footer Section */}
      <footer className="bg-white border-t border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          {/* Column 1: Branding */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-light.jpg"
                alt="Cotswolds Pages"
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-stone-505 leading-relaxed pr-6">
              A high-performance digital business directory service. Connecting visitors and locals to premium boutique hotels, coaching inns, and artisan shops.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-4">Navigation</h4>
            <ul className="space-y-2 text-xs font-semibold text-stone-605">
              <li><a href="#featured" className="hover:text-stone-950 transition">Featured Venues</a></li>
              <li><a href="#how-it-works" className="hover:text-stone-950 transition">How it Works</a></li>
              <li><Link href="/search" className="hover:text-stone-950 transition">Search Directory</Link></li>
              <li><Link href="/listings/submit" className="hover:text-stone-950 transition">List Your Business</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-4">Contact Us</h4>
            <ul className="space-y-2 text-xs text-stone-505 leading-relaxed">
              <li>Email: <a href="mailto:info@cotswoldspages.co.uk" className="font-semibold text-stone-700 hover:text-stone-950">info@cotswoldspages.co.uk</a></li>
              <li>Website: <a href="https://cotswoldspages.co.uk" target="_blank" rel="noopener noreferrer" className="font-semibold text-stone-700 hover:text-stone-950">cotswoldspages.co.uk</a></li>
              <li className="pt-2 flex gap-3 text-stone-400">
                <a href="#" className="hover:text-stone-750">Facebook</a>
                <span>•</span>
                <a href="#" className="hover:text-stone-750">Instagram</a>
                <span>•</span>
                <a href="#" className="hover:text-stone-750">YouTube</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-100 mt-12 pt-8 text-center text-[10px] text-stone-400">
          <p>© {new Date().getFullYear()} Cotswolds Pages. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
