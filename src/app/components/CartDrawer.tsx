"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
import { formatGbp } from "@/lib/shop";
import { useShopCart } from "./ShopCartProvider";

export default function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, setQuantity, removeItem } = useShopCart();
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const totalSavings = items.reduce(
    (sum, item) => sum + Math.max(0, (item.product.original_price_gbp - item.product.price_gbp) * item.quantity),
    0,
  );

  const checkout = async () => {
    setCheckoutError("");
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            fragrance: item.fragrance,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "Checkout is unavailable.");
      window.location.href = result.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout is unavailable.");
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Shopping basket">
      <button className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]" onClick={closeCart} aria-label="Close basket" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in-right flex-col bg-[#faf8f3] shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-700">Lana Lotus Craft</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-stone-950">Shopping basket</h2>
          </div>
          <button onClick={closeCart} className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition hover:bg-white" aria-label="Close basket">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <h3 className="mt-5 font-serif text-xl font-bold text-stone-950">Your basket is waiting</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-stone-500">Discover small-batch botanical candles, wax melts & sachets.</p>
            <Link href="/shop" onClick={closeCart} className="mt-6 rounded-full bg-amber-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-700">
              Explore the collection
            </Link>
          </div>
        ) : (
          <>
            {totalSavings > 0 && (
              <div className="bg-emerald-50 px-5 py-2.5 text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5 border-b border-emerald-100">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Promotional offer: You are saving {formatGbp(totalSavings)} today!</span>
              </div>
            )}

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
              {items.map(({ cartItemId, product, quantity, fragrance }) => (
                <div key={cartItemId} className="grid grid-cols-[88px_1fr] gap-4 border-b border-stone-200 pb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image_url} alt="" className="aspect-square w-full rounded-2xl bg-stone-100 object-cover shadow-xs" />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/shop/${product.slug}`} onClick={closeCart} className="font-serif text-base font-bold text-stone-950 hover:text-amber-700">{product.name}</Link>
                        {fragrance && (
                          <p className="mt-0.5 text-xs font-medium text-amber-800">
                            Fragrance: <span className="font-semibold">{fragrance}</span>
                          </p>
                        )}
                        <p className="mt-0.5 text-[11px] uppercase tracking-wider text-stone-400">{product.weight_label}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-bold text-stone-900">{formatGbp(product.price_gbp * quantity)}</span>
                        {product.original_price_gbp > product.price_gbp && (
                          <span className="block text-[11px] text-stone-400 line-through">
                            {formatGbp(product.original_price_gbp * quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-stone-200 bg-white">
                        <button onClick={() => setQuantity(cartItemId, quantity - 1)} className="flex h-9 w-9 items-center justify-center text-stone-500 hover:text-stone-950" aria-label={`Decrease ${product.name} quantity`}><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-7 text-center text-xs font-bold tabular-nums">{quantity}</span>
                        <button onClick={() => setQuantity(cartItemId, quantity + 1)} className="flex h-9 w-9 items-center justify-center text-stone-500 hover:text-stone-950" aria-label={`Increase ${product.name} quantity`}><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <button onClick={() => removeItem(cartItemId)} className="flex h-9 w-9 items-center justify-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${product.name}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 bg-white px-5 py-5 sm:px-7">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <div className="text-right">
                  <strong className="text-base text-stone-950">{formatGbp(subtotal)}</strong>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-stone-400">Free delivery throughout the UK.</p>
              {checkoutError && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{checkoutError}</p>}
              <button onClick={checkout} disabled={isCheckingOut} className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-amber-600 px-6 text-sm font-bold text-white shadow-lg shadow-amber-900/10 transition hover:bg-amber-700 disabled:cursor-wait disabled:opacity-60">
                {isCheckingOut ? "Preparing secure checkout…" : "Secure checkout"}
              </button>
              <button onClick={closeCart} className="mt-2 min-h-11 w-full text-xs font-bold text-stone-500 hover:text-stone-900">Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
