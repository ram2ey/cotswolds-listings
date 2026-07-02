import CotswoldsSearch from "./components/CotswoldsSearch";
import { PlusCircle, Star, MapPin, Hotel, Utensils, Store, Compass, HelpCircle, ShieldCheck, Zap } from "lucide-react";
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
        title: "The Lygon Arms",
        slug: "the-lygon-arms-broadway",
        description: "Historic 16th-century coaching inn offering luxury rooms and fine dining.",
        category: "Hotel & Accommodation",
        address: "High St, Broadway",
        phone: "+44 1386 852255",
        rating: 4.8,
        images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"]
      },
      {
        id: "mock-2",
        title: "The Wild Rabbit",
        slug: "the-wild-rabbit-kingham",
        description: "Chic gastropub serving local organic ingredients in a cozy setting in Kingham.",
        category: "Gastropub & Inn",
        address: "Church St, Kingham",
        phone: "+44 1608 658389",
        rating: 4.7,
        images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"]
      },
      {
        id: "mock-3",
        title: "The Porch House",
        slug: "the-porch-house-stow-on-the-wold",
        description: "England's oldest inn dating back to 947 AD, serving classic British food.",
        category: "Gastropub & Inn",
        address: "Digbeth St, Stow-on-the-Wold",
        phone: "+44 1451 870048",
        rating: 4.6,
        images: ["https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=800&q=80"]
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

export default async function Home() {
  const featured = await getFeaturedListings();

  const categories = [
    { name: "Hotel & Accommodation", icon: Hotel, desc: "Boutique stays, estates & historic inns", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80" },
    { name: "Pub & Restaurant", icon: Utensils, desc: "Gastropubs, tea rooms & fine dining", img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=500&q=80" },
    { name: "Gastropub & Inn", icon: Hotel, desc: "Traditional coaching inns & taverns", img: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=500&q=80" },
    { name: "Boutique Shop", icon: Store, desc: "Artisans, antiques & local farm shops", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80" },
    { name: "Attraction & Tour", icon: Compass, desc: "Landmarks, manor estates & walking trails", img: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=500&q=80" },
    { name: "Local Business", icon: HelpCircle, desc: "Services, builders, salons & trades", img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=500&q=80" }
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
      <header className="bg-white border-b border-stone-200 py-4">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/50 animate-pulse" />
            <span className="font-serif text-xl font-extrabold tracking-tight text-stone-950">
              Cotswolds<span className="text-amber-500 font-sans">.UK</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-bold">
            <Link href="/search" className="text-stone-605 hover:text-stone-900 transition">Find Businesses</Link>
            <a href="#how-it-works" className="text-stone-605 hover:text-stone-900 transition hidden sm:inline-block">How it Works</a>
            <Link
              href="/listings/submit"
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Your Listing
            </Link>
          </div>
        </div>
      </header>

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
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <MapPin className="h-8 w-8 stroke-1" />
                      </div>
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
                        <span className="truncate">{item.address || `${item.sub_region}, Cotswolds`}</span>
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
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Process Guide</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950">How does Cotswolds.UK Directory work?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200/80 shadow-2xs text-center flex flex-col items-center">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl w-12 h-12 flex items-center justify-center mb-5">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-950 mb-2">Exploring the Cotswolds Made Easy</h3>
              <p className="text-[11px] text-stone-550 leading-relaxed pr-2">
                We have made it easier for you to explore businesses in your community.
              </p>
            </div>

            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200/80 shadow-2xs text-center flex flex-col items-center">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl w-12 h-12 flex items-center justify-center mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-950 mb-2">Supporting Local Businesses</h3>
              <p className="text-[11px] text-stone-550 leading-relaxed pr-2">
                Whether you’re a new startup or an established company, our platform helps you stand out. Boosting your visibility, showcasing your offerings and reaching new customers Online and Off-line.
              </p>
            </div>

            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200/80 shadow-2xs text-center flex flex-col items-center">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl w-12 h-12 flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-950 mb-2">Empowering Local Venues</h3>
              <p className="text-[11px] text-stone-550 leading-relaxed pr-2">
                Claim your listing to unlock premium Gold Partner visibility, custom Highlights, reviews, menus, and on-demand live image synchronization.
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
            Cotswolds.UK Directory is the best way to find & discover great local businesses
          </h2>
          <p className="text-stone-300 text-xs mt-4 max-w-xl mx-auto leading-relaxed">
            Verify ownership of your business listing to gain priority rankings, unlock photo galleries, add custom FAQs, and start getting direct client leads on WhatsApp.
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
              <span className="h-3.5 w-3.5 rounded-full bg-amber-500" />
              <span className="font-serif text-lg font-extrabold tracking-tight text-stone-950">
                Cotswolds<span className="text-amber-500 font-sans">.UK</span>
              </span>
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
              <li>Email: <a href="mailto:info@cotswolds.uk" className="font-semibold text-stone-700 hover:text-stone-950">info@cotswolds.uk</a></li>
              <li>Website: <a href="https://cotswolds.uk" target="_blank" rel="noopener noreferrer" className="font-semibold text-stone-700 hover:text-stone-950">cotswolds.uk</a></li>
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
          <p>© {new Date().getFullYear()} Cotswolds.UK Directory. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
