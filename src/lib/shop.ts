import { createClient } from "@supabase/supabase-js";

export type ProductCategory = "Candles" | "Wax Melts" | "Wax Sachets";

export interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  category: ProductCategory;
  description: string;
  price_gbp: number;
  original_price_gbp: number;
  image_url: string;
  fragrance_family: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  burn_time: string;
  size_grams: number;
  weight_label: string;
  adorned_with: string;
  scent_mood: string;
  fragrance_options?: string[];
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
}

const REMOVED_PRODUCT_SLUGS = new Set(["discovery-set", "scented-wax-sachets"]);
export const isAvailableProduct = (product: ShopProduct) => !REMOVED_PRODUCT_SLUGS.has(product.slug);

export const LANA_LOTUS_PRODUCTS: ShopProduct[] = [
  {
    id: "d1000001-0000-4000-8000-000000000001",
    slug: "floral-musk",
    name: "Floral Musk",
    eyebrow: "Serene & Luxurious",
    category: "Candles",
    description: "A musky, smooth, and balanced aroma with cool florals and creamy undertones. Hand-poured with soy wax and decorated with natural stones and dried petals for a calm, refined ambiance.",
    price_gbp: 39.99,
    original_price_gbp: 49.99,
    image_url: "/shop/floral-musk.jpg",
    fragrance_family: "Floral & Musk",
    top_notes: ["Lily", "Peony"],
    heart_notes: ["Rose", "Jasmine"],
    base_notes: ["Carnation", "Creamy Musk"],
    burn_time: "35–40 hours",
    size_grams: 225,
    weight_label: "8oz (approx. 225g)",
    adorned_with: "Natural chip stones, dried flowers, and petals",
    scent_mood: "Musky, smooth, and balanced, with a creamy, harmonious aroma — serene, luxurious, and perfect for a calm, refined ambiance",
    stock_quantity: 18,
    is_featured: true,
    is_active: true,
    display_order: 1,
  },
  {
    id: "d1000001-0000-4000-8000-000000000002",
    slug: "morning-dew",
    name: "Morning Dew",
    eyebrow: "Fresh & Grounding",
    category: "Candles",
    description: "Light, airy, and rejuvenating with fresh eucalyptus, geranium, and mint that lifts the senses. Grounded with genuine green aventurine crystals and dried botanicals for peaceful renewal.",
    price_gbp: 39.99,
    original_price_gbp: 49.99,
    image_url: "/shop/morning-dew.jpg",
    fragrance_family: "Fresh & Herbal",
    top_notes: ["Fresh Eucalyptus", "Crisp Mint"],
    heart_notes: ["Floral Geranium", "Lemongrass"],
    base_notes: ["Green Aventurine Energy", "Crisp Herb Leaf"],
    burn_time: "35–40 hours",
    size_grams: 225,
    weight_label: "8oz (approx. 225g)",
    adorned_with: "Dried flowers, lemongrass, and green aventurine stones for grounding and healing energy",
    scent_mood: "Light, airy, and rejuvenating, with a serene freshness that lifts the senses — perfect for clarity, calm, and peaceful renewal",
    stock_quantity: 20,
    is_featured: true,
    is_active: true,
    display_order: 2,
  },
  {
    id: "d1000001-0000-4000-8000-000000000003",
    slug: "sweet-memories",
    name: "Sweet Memories",
    eyebrow: "Bright & Uplifting",
    category: "Candles",
    description: "A lively blend of juicy fruits with subtle rustic undertones and sweet, playful highlights. Decorated with natural pink rhodonite stones to promote emotional healing, compassion, and nurturing energy.",
    price_gbp: 39.99,
    original_price_gbp: 49.99,
    image_url: "/shop/sweet-memories.jpg",
    fragrance_family: "Fruity & Sweet",
    top_notes: ["Juicy Orchard Fruits", "Summer Berries"],
    heart_notes: ["Subtle Rustic Undertones", "Sweet Florals"],
    base_notes: ["Golden Sugar", "Warm Vanilla"],
    burn_time: "35–40 hours",
    size_grams: 225,
    weight_label: "8oz (approx. 225g)",
    adorned_with: "Pink rhodonite for emotional healing, compassion, and nurturing energy",
    scent_mood: "Bright, uplifting, and invigorating — radiates joy and creates a cheerful, sunny, and lively ambiance",
    stock_quantity: 22,
    is_featured: true,
    is_active: true,
    display_order: 3,
  },
  {
    id: "d1000001-0000-4000-8000-000000000004",
    slug: "sunset",
    name: "Sunset",
    eyebrow: "Citrus & Creative Energy",
    category: "Candles",
    description: "Fresh and citrussy with juicy peach, zesty orange, and tart cranberry over frosty ice. Adorned with natural orange carnelian stones to stimulate vitality and boost creativity.",
    price_gbp: 39.99,
    original_price_gbp: 49.99,
    image_url: "/shop/sunset.jpg",
    fragrance_family: "Citrus & Fruity",
    top_notes: ["Juicy Peach", "Zesty Orange"],
    heart_notes: ["Tart Cranberry", "Frosty Ice Accord"],
    base_notes: ["Orange Blossom", "Solar Warmth"],
    burn_time: "35–40 hours",
    size_grams: 225,
    weight_label: "8oz (approx. 225g)",
    adorned_with: "Dried botanicals and natural orange carnelian stones to boost energy and creativity",
    scent_mood: "Fresh and citrussy, with a bright, uplifting character that revitalises the space and leaves it feeling lively and refreshed",
    stock_quantity: 16,
    is_featured: true,
    is_active: true,
    display_order: 4,
  },
  {
    id: "d1000001-0000-4000-8000-000000000005",
    slug: "moonlight",
    name: "Moonlight",
    eyebrow: "Calm & Tranquil",
    category: "Candles",
    description: "Calm, refreshing, and gently warm with powdery florals, sweet orange, green leaf, and soothing chamomile. Adorned with dried flower petals and genuine amethyst crystals to promote balance and tranquility.",
    price_gbp: 39.99,
    original_price_gbp: 49.99,
    image_url: "/shop/moonlight.jpg",
    fragrance_family: "Floral & Calming",
    top_notes: ["Sweet Orange", "Green Leaf"],
    heart_notes: ["Soothing Chamomile", "Powdery Florals"],
    base_notes: ["Gentle Warmth", "Soft Petals"],
    burn_time: "35–40 hours",
    size_grams: 225,
    weight_label: "8oz (approx. 225g)",
    adorned_with: "Dried flower petals and natural amethyst stones to promote balance and tranquility",
    scent_mood: "Calm, refreshing, and gently warm — promoting balance and tranquility while creating a peaceful, serene atmosphere",
    stock_quantity: 15,
    is_featured: true,
    is_active: true,
    display_order: 5,
  },
  {
    id: "d1000001-0000-4000-8000-000000000006",
    slug: "sparkle",
    name: "Sparkle",
    eyebrow: "Sweet & Playful",
    category: "Candles",
    description: "Sweet, playful, and wonderfully indulgent with notes of bubblegum, ripe banana, juicy pear drops, warm musk, creamy vanilla, and sugary candyfloss. Adorned with natural rose quartz stones.",
    price_gbp: 39.99,
    original_price_gbp: 49.99,
    image_url: "/shop/sparkle.jpg",
    fragrance_family: "Sweet & Gourmand",
    top_notes: ["Bubblegum", "Ripe Banana", "Juicy Pear Drops"],
    heart_notes: ["Warm Musk", "Sugary Candyfloss"],
    base_notes: ["Creamy Vanilla", "Sweet Confection"],
    burn_time: "35–40 hours",
    size_grams: 225,
    weight_label: "8oz (approx. 225g)",
    adorned_with: "Natural rose quartz stones to promote love, compassion, and emotional healing",
    scent_mood: "Sweet, playful, and indulgent — fun and uplifting, perfect for creating a joyful, lighthearted atmosphere",
    stock_quantity: 14,
    is_featured: false,
    is_active: true,
    display_order: 6,
  },
  {
    id: "d1000001-0000-4000-8000-000000000007",
    slug: "honey-dusk",
    name: "Honey Dusk",
    eyebrow: "Warm & Opulent",
    category: "Candles",
    description: "Warm, opulent, smoky and woody with dark honey, spices, sandalwood, amber, tonka beans, and patchouli. Adorned with natural red agate stones to inspire courage, strength, and grounding.",
    price_gbp: 39.99,
    original_price_gbp: 49.99,
    image_url: "/shop/honey-dusk.jpg",
    fragrance_family: "Woody & Amber",
    top_notes: ["Dark Honey", "Warm Spices"],
    heart_notes: ["Sandalwood", "Tonka Beans"],
    base_notes: ["Golden Amber", "Smoky Patchouli"],
    burn_time: "35–40 hours",
    size_grams: 225,
    weight_label: "8oz (approx. 225g)",
    adorned_with: "Natural red agate stones to promote courage, strength, and grounding",
    scent_mood: "Warm, opulent, smoky and woody — ideal for a cosy evening filled with warmth and comfort",
    stock_quantity: 16,
    is_featured: true,
    is_active: true,
    display_order: 7,
  },
  {
    id: "d1000001-0000-4000-8000-000000000008",
    slug: "lemongrass",
    name: "Lemongrass",
    eyebrow: "Refreshing & Vibrant",
    category: "Candles",
    description: "Crisp, citrusy lemongrass that enlivens your space with vibrant energy. Embellished with beautiful blue-green amazonite gemstones to promote hope and prosperity.",
    price_gbp: 39.99,
    original_price_gbp: 49.99,
    image_url: "/shop/lemongrass.jpg",
    fragrance_family: "Citrus & Herbal",
    top_notes: ["Crisp Lemongrass", "Fresh Citron"],
    heart_notes: ["Aromatic Botanicals", "Crushed Citrus Leaves"],
    base_notes: ["Clean Woody Herbal Finish"],
    burn_time: "35–40 hours",
    size_grams: 225,
    weight_label: "8oz (approx. 225g)",
    adorned_with: "Natural blue-green amazonite stones to promote hope and prosperity",
    scent_mood: "Refreshing, citrusy, and vibrant — energizing and perfect for enhancing focus or creating a revitalizing space",
    stock_quantity: 19,
    is_featured: false,
    is_active: true,
    display_order: 8,
  },
  {
    id: "d1000001-0000-4000-8000-000000000009",
    slug: "rainbow",
    name: "Rainbow",
    eyebrow: "Bright & Fruity Warmth",
    category: "Candles",
    description: "Bright, fruity, and vibrant with zesty orange, grapefruit, dark cassis, and juicy red berries wrapped in cozy warmth. Hand-embellished with an array of natural colourful chip stones.",
    price_gbp: 39.99,
    original_price_gbp: 49.99,
    image_url: "/shop/rainbow.jpg",
    fragrance_family: "Fruity & Citrus",
    top_notes: ["Zesty Orange", "Pink Grapefruit"],
    heart_notes: ["Dark Cassis", "Juicy Red Berries"],
    base_notes: ["Cozy Warm Undertones", "Soft Amber"],
    burn_time: "35–40 hours",
    size_grams: 225,
    weight_label: "8oz (approx. 225g)",
    adorned_with: "Natural chip stones",
    scent_mood: "Bright, fruity, and vibrant, with a cozy warmth that feels uplifting and comforting",
    stock_quantity: 15,
    is_featured: false,
    is_active: true,
    display_order: 9,
  },
  {
    id: "d1000001-0000-4000-8000-000000000010",
    slug: "discovery-set",
    name: "The Lana Lotus Discovery Set",
    eyebrow: "9 Unique Fragrances · Wax Melts",
    category: "Wax Melts",
    description: "A curated set of 9 scented, plant-based wax melts in 9 unique fragrances, each individually packed in a presentation box — perfect for exploring and enjoying a variety of luxurious aromas in your home.",
    price_gbp: 39.99,
    original_price_gbp: 49.99,
    image_url: "/shop/discovery-set.jpg",
    fragrance_family: "Discovery Collection",
    top_notes: ["Sunset", "Moonlight", "Sparkle"],
    heart_notes: ["Lemongrass", "Honey Dusk", "Sweet Memories"],
    base_notes: ["Morning Dew", "Floral Musk", "Rainbow"],
    burn_time: "Up to 90 hours total fragrance",
    size_grams: 180,
    weight_label: "180g (9 individually packed melts)",
    adorned_with: "Matte black presentation gift box with Lana Lotus Craft seal",
    scent_mood: "A complete journey through all 9 signature Lana Lotus fragrances",
    stock_quantity: 25,
    is_featured: true,
    is_active: true,
    display_order: 10,
  },
  {
    id: "d1000001-0000-4000-8000-000000000011",
    slug: "scented-wax-sachets",
    name: "Scented Wax Sachets (Set of 4)",
    eyebrow: "Wardrobe & Drawer Fragrance",
    category: "Wax Sachets",
    description: "An elegant set of 4 plant-based wax sachets in your choice of fragrance, decorated with real pressed flowers and crystals. Designed to beautifully scent wardrobes, drawers, or small spaces, or gently broken apart to use as wax melts.",
    price_gbp: 39.99,
    original_price_gbp: 49.99,
    image_url: "/shop/wax-sachets.jpg",
    fragrance_family: "Botanical & Home",
    top_notes: ["Choose from 6 signature aromas"],
    heart_notes: ["Real Pressed Flowers", "Dried Botanicals"],
    base_notes: ["Natural Crystals", "Plant-Based Soy Wax"],
    burn_time: "Scents spaces for 3–6 months",
    size_grams: 120,
    weight_label: "120g (Set of 4 sachets)",
    adorned_with: "Handmade botanical embeds, natural stones, and hanging cords",
    scent_mood: "Delicate continuous aroma for closets, dressers, linen cupboards, and powder rooms",
    fragrance_options: ["Sunset", "Moonlight", "Honey Dusk", "Sweet Memories", "Morning Dew", "Floral Musk"],
    stock_quantity: 20,
    is_featured: true,
    is_active: true,
    display_order: 11,
  },
];

function configuredSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-supabase-url-here")) return null;
  return createClient(url, key);
}

export async function getShopProducts(): Promise<ShopProduct[]> {
  const supabase = configuredSupabase();
  if (!supabase) return LANA_LOTUS_PRODUCTS.filter(isAvailableProduct);

  const { data, error } = await supabase
    .from("shop_products")
    .select("*")
    .eq("is_active", true)
    .order("display_order")
    .order("name");

  if (error || !data?.length) {
    if (error) console.warn("Shop catalogue unavailable; using Lana Lotus catalogue:", error.message);
    return LANA_LOTUS_PRODUCTS.filter(isAvailableProduct);
  }

  return data.map((product) => ({
    ...product,
    price_gbp: Number(product.price_gbp),
    original_price_gbp: Number(product.original_price_gbp || 49.99),
  })).filter(isAvailableProduct) as ShopProduct[];
}

export async function getShopProductBySlug(slug: string) {
  const products = await getShopProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getShopProductsByIds(ids: string[]) {
  const products = await getShopProducts();
  const wanted = new Set(ids);
  return products.filter((product) => wanted.has(product.id));
}

export async function getCheckoutProductsByIds(ids: string[]): Promise<ShopProduct[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Shop database is not configured.');
  const { data, error } = await createClient(url, key)
    .from('shop_products').select('*').in('id', ids).eq('is_active', true);
  if (error) throw error;
  return (data || []).map((product) => ({
    ...product,
    price_gbp: Number(product.price_gbp),
    original_price_gbp: Number(product.original_price_gbp || 49.99),
  })).filter(isAvailableProduct) as ShopProduct[];
}

export function formatGbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}
