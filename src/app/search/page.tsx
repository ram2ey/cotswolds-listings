import CotswoldsSearch from "../components/CotswoldsSearch";
import Navbar from "../components/Navbar";
import { Suspense } from "react";

export const metadata = {
  title: "Search Local Listings | Cotswolds Pages Directory",
  description: "Browse and search through our verified database of local trades, services, hotels, and restaurants across the Cotswolds.",
};

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Header/Navigation */}
      <Navbar />

      {/* Main Directory Search Console */}
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10 px-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Directory Console</span>
            <h1 className="text-3xl font-serif font-black text-stone-950">Search Directory Listings</h1>
            <p className="text-stone-505 text-xs mt-2">
              Browse through our newly added, verified Cotswolds local businesses. Filter by proximity or category.
            </p>
          </div>
          <Suspense fallback={
            <div className="text-center py-20 bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
              <span className="inline-block h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-stone-505 mt-2">Loading listings console...</p>
            </div>
          }>
            <CotswoldsSearch />
          </Suspense>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-white border-t border-stone-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-light.jpg"
              alt="Cotswolds Pages"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="text-xs text-stone-400">
            <p>© {new Date().getFullYear()} Cotswolds Pages. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
