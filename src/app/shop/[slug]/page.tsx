import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Flame, Gem, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CandleCard from "../../components/CandleCard";
import ProductPurchaseSection from "../../components/ProductPurchaseSection";
import { getShopProductBySlug, getShopProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getShopProductBySlug(slug);
  if (!product) return { title: "Product not found | Lana Lotus Craft" };
  return {
    title: `${product.name} | Lana Lotus Craft Botanical Shop`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([getShopProductBySlug(slug), getShopProducts()]);
  if (!product) notFound();

  const related = allProducts.filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#faf8f3] text-stone-900">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/shop#collection"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-stone-500 transition hover:text-amber-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to full collection
        </Link>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Product Imagery */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-stone-100 border border-stone-200/80 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={`${product.name} - Handcrafted by Lana Lotus Craft`}
            className="aspect-[4/5] h-full w-full object-cover"
          />

        </div>

        {/* Product Info & Purchase Form */}
        <div className="flex flex-col justify-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-800">
            {product.category} · {product.eyebrow}
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl lg:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 text-base leading-7 text-stone-600">
            {product.description}
          </p>

          {/* Scent & Mood Callout */}
          {product.scent_mood && (
            <div className="mt-6 rounded-2xl bg-amber-50/80 border border-amber-200/60 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-700" /> Scent & Mood
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-950 font-medium">
                {product.scent_mood}
              </p>
            </div>
          )}

          {/* Adorned With Gemstones Callout */}
          {product.adorned_with && (
            <div className="mt-3 rounded-2xl bg-white border border-stone-200/80 p-4 shadow-2xs">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Gem className="h-3.5 w-3.5 text-amber-700" /> Adorned With
              </p>
              <p className="mt-1 text-xs leading-5 text-stone-800 font-semibold">
                {product.adorned_with}
              </p>
            </div>
          )}

          {/* Fragrance Notes Breakdown */}
          <div className="mt-6 grid grid-cols-3 gap-2 border-y border-stone-200 py-5">
            {[
              ["Top Notes", product.top_notes],
              ["Heart Notes", product.heart_notes],
              ["Base Notes", product.base_notes],
            ].map(([label, notes]) => (
              <div key={label as string} className="px-2 first:pl-0">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-stone-400">
                  {label as string}
                </p>
                <p className="mt-1.5 text-xs font-semibold leading-5 text-stone-800">
                  {(notes as string[]).join(" · ")}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Pricing, Variant Picker & Add to Cart */}
          <div className="mt-7">
            <ProductPurchaseSection product={product} />
          </div>

          {/* Product Spec Badges */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Flame, text: product.burn_time },
              { icon: Check, text: product.weight_label || `${product.size_grams}g` },
              { icon: Leaf, text: "100% Soy Wax" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 rounded-xl bg-white border border-stone-200/60 px-3 py-2.5 text-xs font-semibold text-stone-700 shadow-2xs"
              >
                <Icon className="h-4 w-4 text-amber-700 shrink-0" />
                <span className="truncate">{text}</span>
              </div>
            ))}
          </div>

          {/* Care & Candle Ritual Accordion */}
          <details className="group mt-8 border-t border-stone-200 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-stone-900">
              Artisan Candle Care & Ritual
              <span className="text-xl font-light text-stone-400 group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="mt-3 space-y-2 text-xs leading-6 text-stone-600">
              <p>• <strong>First Burn:</strong> Let the wax pool reach the full vessel diameter to prevent tunnelling.</p>
              <p>• <strong>Botanicals & Stones:</strong> Gently remove decorative crystals and dried petals with tweezers once the initial wax pool liquefies.</p>
              <p>• <strong>Wick Care:</strong> Always trim the cotton wick to 5mm before every lighting for a clean, soot-free burn.</p>
            </div>
          </details>

          <div className="flex items-center gap-2 border-t border-stone-200 pt-4 text-xs text-stone-500">
            <ShieldCheck className="h-4 w-4 text-amber-700" /> Hand-poured in Bristol, UK. Packed safely with eco-conscious materials.
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-stone-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-800">Explore More</p>
                <h2 className="mt-1 font-serif text-3xl font-bold text-stone-950">You May Also Like</h2>
              </div>
              <Link href="/shop#collection" className="text-xs font-bold text-amber-800 hover:text-amber-900">
                View all items →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <CandleCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer theme="dark" />
    </main>
  );
}
