"use client";

import { ShoppingBag } from "lucide-react";
import { useShopCart } from "./ShopCartProvider";

export default function CartButton({ mobile = false }: { mobile?: boolean }) {
  const { itemCount, openCart } = useShopCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className={mobile
        ? "flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-50 hover:text-stone-950"
        : "relative flex min-h-11 min-w-11 items-center justify-center rounded-full border border-stone-200 text-stone-700 transition hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700"
      }
      aria-label={`Open basket with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
    >
      {mobile && <span>Basket</span>}
      <span className="relative">
        <ShoppingBag className="h-4.5 w-4.5" aria-hidden="true" />
        {itemCount > 0 && (
          <span className="absolute -right-2.5 -top-2.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-extrabold text-white">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </span>
    </button>
  );
}
