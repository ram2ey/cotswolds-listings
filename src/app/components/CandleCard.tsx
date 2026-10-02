import Link from "next/link";
import type { ShopProduct } from "@/lib/shop";
import { formatGbp } from "@/lib/shop";
import AddToCartButton from "./AddToCartButton";
import { Sparkles } from "lucide-react";

export default function CandleCard({ product }: { product: ShopProduct }) {
  const savings = Math.max(0, product.original_price_gbp - product.price_gbp);

  return (
    <article className="group flex h-full flex-col bg-white rounded-3xl p-3 border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-amber-200 transition-all duration-300">
      <Link href={`/shop/${product.slug}`} className="relative block overflow-hidden rounded-2xl bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={`${product.name} - Lana Lotus Craft`}
          className="aspect-[4/5] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />

        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 items-start">
          {savings > 0 && (
            <span className="rounded-full bg-amber-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> Save {formatGbp(savings)}
            </span>
          )}
        </div>

        {/* Size Badge */}
        <span className="absolute right-3 bottom-3 rounded-full bg-stone-900/75 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          {product.weight_label || `${product.size_grams}g`}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-800">
            {product.category} · {product.eyebrow}
          </p>
        </div>

        <div className="mt-1.5 flex items-start justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-950">
              <Link href={`/shop/${product.slug}`} className="hover:text-amber-700 transition-colors">
                {product.name}
              </Link>
            </h2>
            <p className="mt-1 text-xs text-stone-500 line-clamp-1">
              {product.top_notes[0]}, {product.heart_notes[0]} & {product.base_notes[0]}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="block text-base font-extrabold text-stone-950">
              {formatGbp(product.price_gbp)}
            </span>
            {product.original_price_gbp > product.price_gbp && (
              <span className="block text-xs font-medium text-stone-400 line-through">
                {formatGbp(product.original_price_gbp)}
              </span>
            )}
          </div>
        </div>

        {product.adorned_with && (
          <p className="mt-2 text-[11px] text-amber-900/80 bg-amber-50/70 border border-amber-100 rounded-lg px-2 py-1 line-clamp-1">
            <span className="font-semibold text-amber-950">Adorned:</span> {product.adorned_with}
          </p>
        )}

        <div className="mt-auto pt-4">
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}
