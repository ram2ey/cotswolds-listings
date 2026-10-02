"use client";

import { useState, useMemo } from "react";
import type { ShopProduct } from "@/lib/shop";
import CandleCard from "./CandleCard";
import { Search } from "lucide-react";

interface ProductCatalogGridProps {
  products: ShopProduct[];
}

export default function ProductCatalogGrid({ products }: ProductCatalogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories: { label: string; value: string; count: number }[] = useMemo(() => {
    const candleCount = products.filter((p) => p.category === "Candles").length;
    const meltCount = products.filter((p) => p.category === "Wax Melts").length;
    const sachetCount = products.filter((p) => p.category === "Wax Sachets").length;

    return [
      { label: "All Items", value: "All", count: products.length },
      { label: "Botanical Candles (8oz)", value: "Candles", count: candleCount },
      { label: "Discovery Sets", value: "Wax Melts", count: meltCount },
      { label: "Wax Sachets", value: "Wax Sachets", count: sachetCount },
    ].filter((category) => category.value === "All" || category.count > 0);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.fragrance_family.toLowerCase().includes(q) ||
        product.top_notes.some((n) => n.toLowerCase().includes(q)) ||
        product.heart_notes.some((n) => n.toLowerCase().includes(q)) ||
        product.base_notes.some((n) => n.toLowerCase().includes(q)) ||
        product.adorned_with.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div>
      {/* Category Tabs and Quick Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-800 text-white shadow-md shadow-amber-900/10 scale-102"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-amber-400 hover:text-stone-900"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search scent notes, crystals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-stone-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 shadow-xs"
          />
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50/50 p-12 text-center">
          <p className="font-serif text-lg font-bold text-stone-900">No fragrances matched your filter</p>
          <p className="mt-1 text-xs text-stone-500">Try clearing your search query or selecting &quot;All Items&quot;.</p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="mt-4 rounded-full bg-amber-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-amber-700 cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <CandleCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
