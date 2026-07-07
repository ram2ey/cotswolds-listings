import CotswoldsSearch from "../components/CotswoldsSearch";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
      <Footer theme="light" />
    </div>
  );
}
