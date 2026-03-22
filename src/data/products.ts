/**
 * Static product catalogue for the Lumière candle store.
 * In production this would come from an API; for now it drives
 * the Home grid and Product detail pages.
 */

/** Represents a single candle product. */
export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  /** URL-safe slug used for routing */
  slug: string;
  category: "signature" | "seasonal" | "limited";
  /** High-res image URL (Unsplash placeholders for now) */
  image: string;
  /** Fragrance note highlights */
  notes: string[];
  /** Burn time in hours */
  burnTime: number;
  /** Weight in grams */
  weight: number;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: "lum-001",
    name: "Golden Hour",
    tagline: "Warm amber meets sun-kissed vanilla",
    description:
      "Inspired by the last light of a Mediterranean sunset, Golden Hour wraps your space in layers of warm amber, sun-kissed vanilla, and a whisper of sandalwood. Hand-poured with 100 % natural soy wax.",
    price: 2499,
    slug: "golden-hour",
    category: "signature",
    image: "/golden-hour.png",
    notes: ["Amber", "Vanilla", "Sandalwood"],
    burnTime: 55,
    weight: 280,
    inStock: true,
  },
  {
    id: "lum-002",
    name: "Midnight Oud",
    tagline: "Deep oud softened with rose petals",
    description:
      "A bold, intoxicating blend of rare oud, dark rose, and smoky vetiver. Midnight Oud transforms any room into an opulent sanctuary. Encased in a matte-black ceramic vessel.",
    price: 3499,
    slug: "midnight-oud",
    category: "signature",
    image: "/midnight-oud.png",
    notes: ["Oud", "Rose", "Vetiver"],
    burnTime: 60,
    weight: 320,
    inStock: true,
  },
  {
    id: "lum-003",
    name: "Cedarwood Bliss",
    tagline: "Forest warmth in every flicker",
    description:
      "Close your eyes and breathe in the quiet warmth of a cedar cabin at dusk. Grounded with patchouli and lifted by bergamot, this candle is serenity in a jar.",
    price: 1999,
    slug: "cedarwood-bliss",
    category: "signature",
    image: "/cedarwood-bliss.png",
    notes: ["Cedarwood", "Patchouli", "Bergamot"],
    burnTime: 50,
    weight: 260,
    inStock: true,
  },
  {
    id: "lum-004",
    name: "Winter Spice",
    tagline: "Cinnamon, clove & holiday magic",
    description:
      "A seasonal favourite returning by popular demand. Winter Spice mingles cinnamon bark, crushed clove, and candied orange peel with a base of creamy tonka bean.",
    price: 2799,
    slug: "winter-spice",
    category: "seasonal",
    image: "/winter-spice.png",
    notes: ["Cinnamon", "Clove", "Tonka Bean"],
    burnTime: 45,
    weight: 250,
    inStock: true,
  },
  {
    id: "lum-005",
    name: "Jasmine Noir",
    tagline: "Night-blooming jasmine & musk",
    description:
      "Captured under a moonlit sky, Jasmine Noir intertwines night-blooming jasmine with white musk and a trace of black pepper. Limited edition — once it's gone, it's gone.",
    price: 3999,
    slug: "jasmine-noir",
    category: "limited",
    image: "/jasmine-noir.png",
    notes: ["Jasmine", "White Musk", "Black Pepper"],
    burnTime: 55,
    weight: 300,
    inStock: true,
  },
  {
    id: "lum-006",
    name: "Velvet Rose",
    tagline: "Lush Damascena rose layered with silk",
    description:
      "An ode to timeless elegance, Velvet Rose balances Damascena rose absolute with silky iris butter and a warm cashmere base. The perfect gift for someone unforgettable.",
    price: 2999,
    slug: "velvet-rose",
    category: "signature",
    image: "/velvet-rose.png",
    notes: ["Rose", "Iris", "Cashmere Wood"],
    burnTime: 50,
    weight: 280,
    inStock: false,
  },
];

/**
 * Looks up a product by its URL slug.
 * @param slug - The URL-safe product slug.
 * @returns The matching Product or undefined.
 */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
