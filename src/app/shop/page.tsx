import type { Metadata } from "next";
import { ArrowDown, Flame, Gem, HeartHandshake, Leaf, PackageCheck, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCatalogGrid from "../components/ProductCatalogGrid";
import { getShopProducts } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Lana Lotus Craft | Handcrafted Botanical Candles & Wax Melts",
  description: "Handcrafted scented candles, wax melts, and wax sachets made with soy and plant-based wax, adorned with natural crystals and dried botanicals.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getShopProducts();

  return (
    <main className="min-h-screen bg-[#faf8f3] text-stone-900">
      <Navbar />

      {/* Promotional Top Bar */}
      <div className="bg-amber-700 text-white text-xs font-semibold px-4 py-2 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
        <span>Artisan Launch Offer: All signature candles, sets & sachets now <strong>£39.99</strong> (Regular £49.99) — Save £10 today!</span>
      </div>

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[#183325] text-white">
        <div
          className="absolute inset-0 opacity-25"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 75% 30%, #a2c4b0 0, transparent 32%), radial-gradient(circle at 20% 85%, #d4b478 0, transparent 35%)",
          }}
        />
        <div className="relative mx-auto grid min-h-[540px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <div className="max-w-2xl">

            <h1 className="font-serif text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-stone-50">
              Artisan Candles &<br />Botanical Treasures.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-stone-200 sm:text-lg">
              Handcrafted scented candles, wax melts, and wax sachets made with soy and plant-based wax. Uniquely decorated with natural healing crystals, dried flowers, and pure botanicals, making every piece truly one of a kind.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#collection"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-500 px-7 text-sm font-bold text-stone-950 transition hover:bg-amber-400 shadow-lg shadow-black/20"
              >
                Browse Catalogue <ArrowDown className="h-4 w-4" />
              </a>
              <span className="text-xs text-stone-300 font-medium">
                100% Vegan & Cruelty-Free · UK Small Batch
              </span>
            </div>
          </div>

          {/* Hero Visual Collage */}
          <div className="relative mx-auto w-full max-w-md lg:block">
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-2 shadow-2xl backdrop-blur-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/shop/lana-lotus-cover.jpg"
                alt="Lana Lotus Craft hand-poured botanical candles in golden tins"
                className="aspect-square w-full rounded-2xl object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-stone-950/75 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-sm font-bold text-white">Pure Soy & Botanical Wax</p>
                    <p className="text-[11px] text-amber-300">Decorated with genuine healing stones</p>
                  </div>
                  <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-black text-stone-950">
                    £39.99 <span className="line-through text-stone-800 text-[10px] font-normal">£49.99</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artisan Value Badges */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-y divide-stone-200 px-4 sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          {[
            {
              icon: Leaf,
              title: "100% Plant & Soy Wax",
              text: "Vegan, cruelty-free, and clean burning",
            },
            {
              icon: Gem,
              title: "Natural Healing Crystals",
              text: "Amethyst, aventurine, rhodonite & carnelian",
            },
            {
              icon: HeartHandshake,
              title: "Handmade Small Batches",
              text: "Every vessel is individually adorned & unique",
            },
            {
              icon: PackageCheck,
              title: "Free UK Delivery",
              text: "Dispatched safely with free UK shipping on every order",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3.5 px-3 py-5 sm:px-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xs font-extrabold text-stone-900">{title}</h3>
                <p className="mt-0.5 text-[11px] text-stone-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-800">
                The Complete Catalogue
              </p>
              <h2 className="mt-1 font-serif text-3xl font-bold text-stone-950 sm:text-4xl">
                Explore The Collection
              </h2>
            </div>
            <p className="max-w-md text-xs leading-5 text-stone-500">
              Each candle and sachet is handmade and uniquely decorated with natural stones, dried flowers, and plants.
            </p>
          </div>

          {/* Interactive Catalog Grid with Category Tabs */}
          <ProductCatalogGrid products={products} />
        </div>
      </section>

      {/* Artisan Care & Safety Guide */}
      <section className="border-t border-stone-200 bg-[#f4efe6] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 mb-3">
            <Flame className="h-3.5 w-3.5 text-amber-700" />
            <span>Candle Care & Ritual</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-950 sm:text-4xl">
            Caring for Your Botanical Candle
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-stone-600">
            Because our candles are uniquely adorned with natural gemstones and dried botanical petals, follow these simple tips to ensure the cleanest, safest, and most fragrant burn:
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 text-left">
            <div className="rounded-2xl bg-white p-5 shadow-xs border border-stone-200/60">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-800 text-xs font-black">1</span>
              <h4 className="mt-3 text-xs font-bold text-stone-950">The First Burn</h4>
              <p className="mt-1 text-xs leading-5 text-stone-500">Allow the melted wax pool to reach the outer edge of the golden vessel to prevent tunnelling.</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-xs border border-stone-200/60">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-800 text-xs font-black">2</span>
              <h4 className="mt-3 text-xs font-bold text-stone-950">Gemstones & Botanicals</h4>
              <p className="mt-1 text-xs leading-5 text-stone-500">Once the top layer liquefies, you can gently retrieve decorative stones with tweezers to keep as keepsakes.</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-xs border border-stone-200/60">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-800 text-xs font-black">3</span>
              <h4 className="mt-3 text-xs font-bold text-stone-950">Trim the Wick</h4>
              <p className="mt-1 text-xs leading-5 text-stone-500">Trim the cotton wick to 5mm before every relighting for a soot-free, tranquil and balanced burn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Custom Orders Note */}
      <section className="border-t border-stone-200 bg-white py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Bespoke Orders & Inquiries</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-stone-900">Have questions or custom fragrance requests?</h3>
          <p className="mt-2 text-xs text-stone-500">
            For more information about Lana Lotus Craft products, custom gifts, or bulk wedding favours, feel free to reach out via our contact form or connect with the maker on Instagram.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <a
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <Footer theme="dark" />
    </main>
  );
}
