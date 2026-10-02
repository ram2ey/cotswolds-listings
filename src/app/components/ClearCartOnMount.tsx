"use client";

import { useEffect } from "react";
import { useShopCart } from "./ShopCartProvider";

export default function ClearCartOnMount() {
  const { clearCart } = useShopCart();
  useEffect(() => clearCart(), [clearCart]);
  return null;
}
