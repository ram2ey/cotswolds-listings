"use client";

import { useState } from "react";
import type { ShopProduct } from "@/lib/shop";
import { formatGbp } from "@/lib/shop";
import { useShopCart } from "./ShopCartProvider";
import { ShoppingBag, Check, Sparkles, Minus, Plus } from "lucide-react";

export default function ProductPurchaseSection({ product }: { product: ShopProduct }) {
  const { addItem } = useShopCart();
  const options = product.fragrance_options || [];
  const [selectedFragrance, setSelectedFragrance] = useState<string>(options[0] || "");
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  const savingsPerItem = Math.max(0, product.original_price_gbp - product.price_gbp);
  const isSoldOut = product.stock_quantity < 1;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addItem(product, quantity, options.length > 0 ? selectedFragrance : undefined);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Price with Discount Callout */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-extrabold text-stone-950 font-serif">
          {formatGbp(product.price_gbp)}
        </span>
        {savingsPerItem > 0 && (
          <>
            <span className="text-lg font-medium text-stone-400 line-through">
              {formatGbp(product.original_price_gbp)}
            </span>
            <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white flex items-center gap-1 shadow-xs">
              <Sparkles className="h-3 w-3" /> Save {formatGbp(savingsPerItem)}
            </span>
          </>
        )}
      </div>

      {/* Fragrance Options (if applicable, e.g. Wax Sachets) */}
      {options.length > 0 && (
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
            Choose Fragrance Variant: <span className="text-amber-800">{selectedFragrance}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {options.map((scent) => {
              const isSelected = selectedFragrance === scent;
              return (
                <button
                  key={scent}
                  type="button"
                  onClick={() => setSelectedFragrance(scent)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-800 text-white shadow-md shadow-amber-900/10 scale-102 border-amber-800"
                      : "bg-white text-stone-700 border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50"
                  }`}
                >
                  {scent}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart Controls */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
        <div className="flex items-center justify-between rounded-full border border-stone-200 bg-white px-2 py-1 sm:w-36">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 hover:text-stone-950 hover:bg-stone-100 transition cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-stone-900 tabular-nums px-2">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 hover:text-stone-950 hover:bg-stone-100 transition cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          disabled={isSoldOut}
          onClick={handleAddToCart}
          className="flex-1 flex min-h-13 items-center justify-center gap-2 rounded-full bg-amber-600 px-8 text-sm font-bold text-white shadow-lg shadow-amber-900/15 transition hover:bg-amber-700 active:bg-amber-800 disabled:bg-stone-300 disabled:cursor-not-allowed cursor-pointer"
        >
          {addedNotice ? (
            <>
              <Check className="h-4 w-4 text-emerald-200" />
              <span>Added to your basket!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>{isSoldOut ? "Currently Unavailable" : `Add to Basket • ${formatGbp(product.price_gbp * quantity)}`}</span>
            </>
          )}
        </button>
      </div>

      <p className="text-center text-[11px] text-stone-400">
        Free UK Delivery on orders over £50 · Secure checkout powered by Stripe
      </p>
    </div>
  );
}
