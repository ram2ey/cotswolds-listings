"use client";

import Link from "next/link";
import { SlidersHorizontal, ShoppingBag } from "lucide-react";
import type { ShopProduct } from "@/lib/shop";
import { useShopCart } from "./ShopCartProvider";

interface AddToCartButtonProps {
  product: ShopProduct;
  compact?: boolean;
  selectedFragrance?: string;
  onRequireSelection?: () => void;
}

export default function AddToCartButton({
  product,
  compact = false,
  selectedFragrance,
  onRequireSelection,
}: AddToCartButtonProps) {
  const { addItem } = useShopCart();
  const soldOut = product.stock_quantity < 1;
  const hasOptions = (product.fragrance_options?.length ?? 0) > 0;

  // On card view, if the product has options that must be selected, direct to detail page
  if (compact && hasOptions && !selectedFragrance) {
    return (
      <Link
        href={`/shop/${product.slug}`}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-amber-600/30 bg-amber-50 px-4 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-amber-700" />
        Choose fragrance
      </Link>
    );
  }

  const handleAdd = () => {
    if (hasOptions && !selectedFragrance) {
      if (onRequireSelection) {
        onRequireSelection();
        return;
      }
    }
    addItem(product, 1, selectedFragrance);
  };

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={handleAdd}
      className={
        compact
          ? "flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-amber-600 px-4 text-xs font-bold text-white transition hover:bg-amber-700 active:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          : "flex min-h-13 w-full items-center justify-center gap-2.5 rounded-full bg-amber-600 px-6 text-sm font-bold text-white shadow-lg shadow-amber-900/15 transition hover:bg-amber-700 active:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-300"
      }
    >
      <ShoppingBag className="h-4 w-4" />
      {soldOut ? "Currently unavailable" : "Add to basket"}
    </button>
  );
}
