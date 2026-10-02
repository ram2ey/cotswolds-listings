import { NextRequest, NextResponse } from "next/server";
import { getShopProductsByIds } from "@/lib/shop";
import { isStripeMock, stripe } from "@/lib/stripe";
import { getErrorMessage } from "@/lib/api-utils";

interface RequestedItem {
  productId: string;
  quantity: number;
  fragrance?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requested: RequestedItem[] = Array.isArray(body.items) ? body.items : [];

    if (!requested.length || requested.length > 20) {
      return NextResponse.json({ error: "Your basket is empty or contains too many items." }, { status: 400 });
    }

    const normalized = requested.map((item) => ({
      productId: String(item.productId || ""),
      quantity: Math.floor(Number(item.quantity)),
      fragrance: item.fragrance ? String(item.fragrance).slice(0, 50) : undefined,
    }));

    if (normalized.some((item) => !item.productId || !Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 10)) {
      return NextResponse.json({ error: "One or more basket quantities are invalid." }, { status: 400 });
    }

    const uniqueProductIds = Array.from(new Set(normalized.map((item) => item.productId)));
    const products = await getShopProductsByIds(uniqueProductIds);
    if (products.length !== uniqueProductIds.length) {
      return NextResponse.json({ error: "One or more products are no longer available." }, { status: 400 });
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    for (const item of normalized) {
      const product = productMap.get(item.productId)!;
      if (!product.is_active || item.quantity > product.stock_quantity) {
        return NextResponse.json({ error: `${product.name} does not have enough stock for that quantity.` }, { status: 409 });
      }
    }

    const origin = request.nextUrl.origin;
    const orderId = crypto.randomUUID();
    const compactCart = normalized
      .map((item) => `${item.productId}:${item.quantity}${item.fragrance ? `:${item.fragrance}` : ""}`)
      .join(",");

    if (isStripeMock()) {
      return NextResponse.json({
        url: `${origin}/shop/order-success?mock=1&order=${orderId}`,
      });
    }

    const subtotalPence = normalized.reduce((sum, item) => {
      const product = productMap.get(item.productId)!;
      return sum + Math.round(product.price_gbp * 100) * item.quantity;
    }, 0);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: normalized.map((item) => {
        const product = productMap.get(item.productId)!;
        const itemName = item.fragrance ? `${product.name} (${item.fragrance})` : product.name;
        const itemDesc = `${product.weight_label || `${product.size_grams}g`} · ${product.burn_time || "Artisan hand-poured"}`;

        return {
          quantity: item.quantity,
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(product.price_gbp * 100),
            product_data: {
              name: itemName,
              description: itemDesc,
              images: product.image_url.startsWith("http") ? [product.image_url] : undefined,
              metadata: {
                shopProductId: product.id,
                fragrance: item.fragrance || "",
              },
            },
          },
        };
      }),
      shipping_address_collection: { allowed_countries: ["GB"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: subtotalPence >= 5000 ? 0 : 395, currency: "gbp" },
            display_name: subtotalPence >= 5000 ? "Free UK delivery" : "Standard UK delivery",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 5 },
            },
          },
        },
      ],
      allow_promotion_codes: true,
      phone_number_collection: { enabled: true },
      metadata: {
        shopOrder: "true",
        orderId,
        cart: compactCart,
      },
      success_url: `${origin}/shop/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[shop-checkout]", getErrorMessage(error));
    return NextResponse.json({ error: "We could not start checkout. Please try again." }, { status: 500 });
  }
}
