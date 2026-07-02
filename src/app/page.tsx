import CotswoldsSearch from "./components/CotswoldsSearch";
import { PlusCircle, Star, MapPin, Hotel, Utensils, Store, Compass, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

// Try/catch data fetcher to load live Gold Partner featured listings
async function getFeaturedListings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-url-here')) {
    // Return mock gold listings if offline
    return [
      {
        id: "mock-1",
        title: "The Lygon Arms",
        slug: "the-lygon-arms-broadway",
        description: "Historic 16th-century coaching inn offering luxury rooms and fine dining.",
        category: "Hotel & Accommodation",
        address: "High St, Broadway",
        sub_region: "Broadway",
        rating: 4.8,
        reviews_count: 142,
        images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"]
      },
      {
        id: "mock-2",
        title: "The Wild Rabbit",
        slug: "the-wild-rabbit-kingham",
        description: "Chic gastropub serving local organic ingredients in a cozy setting in Kingham.",
        category: "Gastropub & Inn",
        address: "Church St, Kingham",
        sub_region: "Kingham",
        rating: 4.7,
        reviews_count: 98,
        images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"]
      }
    ];
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/listings?tier=eq.gold&is_approved=eq.true&select=*`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`
      },
      next: { revalidate: 30 } // Cache for 30 seconds
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data.slice(0, 3); // Limit to top 3 featured partners
  } catch (error) {
    console.error("Error loading featured listings, using fallbacks:", error);
    return [];
  }
}

export default async function Home() {
  const featured = await getFeaturedListings();

  const categories = [
    { name: "Hotel & Accommodation", icon: Hotel, desc: "Boutique hotels, B&Bs, and historic inns", count: "Browse Stays", color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" },
    { name: "Pub & Restaurant", icon: Utensils, desc: "Gastropubs, tea rooms, and fine dining", count: "Browse Dining", color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" },
    { name: "Boutique Shop", icon: Store, desc: "Antiques, artisan markets, and farm shops", count: "Browse Shops", color: "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20" },
    { name: "Attraction & Tour", icon: Compass, desc: "Historic houses, walking tours, and activities", count: "Browse Activities", color: "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20" }
  ];

  const counties = [
    { name: 'Gloucestershire', desc: 'Heart of the Cotswolds (Bourton, Stow, Cirencester)', gradient: 'from-amber-800 to-amber-950 shadow-amber-950/15' },
    { name: 'Oxfordshire', desc: 'Gateway villages (Burford, Kingham, Chipping Norton)', gradient: 'from-emerald-800 to-emerald-950 shadow-emerald-950/15' },
    { name: 'Warwickshire', desc: 'Northern countryside edges & trails', gradient: 'from-rose-800 to-rose-950 shadow-rose-950/15' },
    { name: 'Wiltshire', desc: 'Charming southern lanes & Castle Combe', gradient: 'from-slate-700 to-slate-900 shadow-slate-950/15' },
    { name: 'Worcestershire', desc: 'Western orchards, hills & Broadway village', gradient: 'from-purple-800 to-indigo-950 shadow-purple-950/15' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 font-sans scroll-smooth">
      {/* 1. Premium Hero Banner */}
      <section 
        className="relative overflow-hidden bg-stone-950 text-white min-h-[440px] flex flex-col justify-between py-8 border-b border-amber-500/20 bg-cover bg-center"
        style={{ backgroundImage: `url('/hero-bridge.jpg')` }}
      >
        <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-[1px]" />
        
        {/* Navigation & Header */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/50 animate-pulse" />
            <span className="font-serif text-xl font-extrabold tracking-tight text-white">
              Cotswolds<span className="text-amber-500">.UK</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-3 text-xs font-bold">
            <Link
              href="/listings/submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 rounded-xl shadow-lg transition cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              List Your Business
            </Link>
          </div>
        </div>

        {/* Hero Central Content */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-serif text-white leading-tight">
              Discover the Heart <br />
              of the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Cotswolds</span>
            </h1>
            <p className="mt-4 text-stone-200 leading-relaxed font-normal max-w-xl text-sm sm:text-base opacity-95">
              Handpicked boutique hotels, historic coaching inns, cozy gastropubs, and artisan shops across Gloucestershire, Oxfordshire, and Warwickshire.
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="#search"
                className="px-6 py-3 bg-amber-500 text-stone-950 text-xs font-bold rounded-xl shadow-md hover:bg-amber-600 transition"
              >
                Search Directory
              </a>
              <a
                href="#featured"
                className="px-6 py-3 border border-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-xs hover:bg-white/10 transition"
              >
                Featured Venues
              </a>
            </div>
          </div>
        </div>

        <div className="h-8 relative z-10" />
      </section>

      {/* SECTION 1: Featured Listings (Gold Partners) */}
      {featured && featured.length > 0 && (
        <section id="featured" className="py-16 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Elite Partners</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">Featured Cotswolds Venues</h2>
              </div>
              <p className="text-stone-500 text-xs mt-2 md:mt-0 max-w-md">
                Highly recommended hotels, inns, and restaurants with verified status and premium guest experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.map((item: any) => (
                <div 
                  key={item.id} 
                  className="bg-stone-50 rounded-2xl overflow-hidden border-2 border-amber-500/30 hover:border-amber-500 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <Link href={`/listings/${item.slug}`} className="relative block aspect-video w-full bg-stone-200">
                    {item.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={item.images[0]} 
                        alt={item.title} 
                        className="object-cover w-full h-full hover:scale-103 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <MapPin className="h-8 w-8 stroke-1" />
                      </div>
                    )}
                    <span className="absolute top-3 right-3 bg-amber-500 text-stone-950 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                      Gold Partner
                    </span>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-1.5">
                        <span>{item.category}</span>
                        {item.rating && (
                          <span className="flex items-center gap-0.5 text-stone-900">
                            <Star className="h-3 w-3 fill-current text-amber-500" />
                            {item.rating}
                          </span>
                        )}
                      </div>
                      <h3 className="text-md font-bold font-serif text-stone-950 hover:text-amber-700 transition">
                        <Link href={`/listings/${item.slug}`}>{item.title}</Link>
                      </h3>
                      <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium mt-4 pt-3 border-t border-stone-200/60">
                      <MapPin className="h-3.5 w-3.5 text-stone-400" />
                      <span>{item.address || `${item.sub_region}, Cotswolds`}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: Browse by Category */}
      <section className="py-16 bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Tailored Navigation</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">Browse by Category</h2>
            <p className="text-stone-500 text-xs mt-2">
              Explore handpicked entries organized by their trade and specific travel interests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/?category=${encodeURIComponent(cat.name)}#search`}
                  className="bg-white border border-stone-200 p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-stone-300 transition text-left flex flex-col justify-between h-44 cursor-pointer group"
                >
                  <div>
                    <div className={`p-3 rounded-xl w-11 h-11 flex items-center justify-center mb-4 transition ${cat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-950 group-hover:text-amber-700 transition">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] uppercase font-extrabold tracking-wider text-stone-400 mt-3 group-hover:text-amber-700 transition">
                    <span>{cat.count}</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: Explore by County */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Geographic Regions</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">Explore by County</h2>
            <p className="text-stone-500 text-xs mt-2">
              Filter venues based on their local county borders across the Cotswold region.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {counties.map((cty) => (
              <Link
                key={cty.name}
                href={`/?region=${encodeURIComponent(cty.name)}#search`}
                className={`relative overflow-hidden rounded-2xl p-6 h-36 flex flex-col justify-between text-white bg-gradient-to-br ${cty.gradient} hover:scale-102 transition-all shadow-xs hover:shadow-md cursor-pointer group`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <MapPin className="h-16 w-16" />
                </div>
                <div>
                  <h3 className="text-sm font-black font-serif tracking-tight">{cty.name}</h3>
                  <p className="text-[9px] opacity-80 leading-normal mt-1.5 pr-2">
                    {cty.desc}
                  </p>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN SEARCH SECTION */}
      <main id="search" className="flex-1 bg-stone-50 py-16 scroll-mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10 px-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Search Engine</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">Search the Directory</h2>
            <p className="text-stone-500 text-xs mt-2">
              Refine your selection, sort alphabetically or by GPS proximity, and filter verified Gold Partners.
            </p>
          </div>
          <Suspense fallback={
            <div className="text-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs text-stone-500 mt-2">Loading search console...</p>
            </div>
          }>
            <CotswoldsSearch />
          </Suspense>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-stone-200 bg-white py-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-serif font-bold text-stone-800 tracking-tight text-sm">Cotswolds.UK Directory</p>
          <p className="mt-2 text-stone-400">
            A high-performance localized directory service. Powered by Next.js, PostGIS & Supabase.
          </p>
          <p className="mt-6 text-stone-300">
            © {new Date().getFullYear()} Cotswolds Local Business Directory. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
