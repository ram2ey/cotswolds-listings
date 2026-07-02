import CotswoldsSearch from "./components/CotswoldsSearch";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* 1. Premium Hero Banner with Bridge Background */}
      <section 
        className="relative overflow-hidden bg-stone-950 text-white min-h-[480px] flex flex-col justify-between py-8 border-b border-amber-500/20 bg-cover bg-center"
        style={{ backgroundImage: `url('/hero-bridge.jpg')` }}
      >
        {/* Dark overlay to ensure text contrast and accessibility */}
        <div className="absolute inset-0 bg-stone-950/65 backdrop-blur-[2px]" />
        
        {/* Navigation & Header inside Hero */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/50 animate-pulse" />
            <span className="font-serif text-xl font-extrabold tracking-tight text-white">
              Cotswolds<span className="text-amber-500">.UK</span>
            </span>
          </div>
          
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
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 md:py-16">
          <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-serif text-white leading-tight">
              Discover the Heart <br />
              of the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Cotswolds</span>
            </h1>
            <p className="mt-4 text-stone-200 leading-relaxed font-normal max-w-xl text-sm sm:text-base opacity-90">
              Handpicked boutique hotels, historic coaching inns, cozy gastropubs, and artisan shops across Gloucestershire, Oxfordshire, and Warwickshire.
            </p>
          </div>
        </div>

        {/* Empty spacing to balance the layout overlay */}
        <div className="h-8 relative z-10" />
      </section>

      {/* 2. Main Search & Filter Interface (Overlaps Hero slightly) */}
      <main className="flex-1 -mt-10 relative z-20 pb-16">
        <CotswoldsSearch />
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
