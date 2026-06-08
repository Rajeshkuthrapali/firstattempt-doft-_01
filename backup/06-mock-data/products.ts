/**
 * Lumière Candles — Live product catalogue (v3.0.0)
 *
 * 12 SKUs across Signature, Seasonal, and Limited collections.
 * HSN codes, dimensions, and ingredients included for GST filing and shipping.
 */

/** Represents a single candle product. */
export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  /** discountedPrice: live sale price, undefined if not on sale */
  discountedPrice?: number;
  /** URL-safe slug used for routing */
  slug: string;
  category: "signature" | "seasonal" | "limited";
  /** High-res product image */
  image: string;
  /** Fragrance note highlights */
  notes: string[];
  /** Burn time in hours */
  burnTime: number;
  /** Weight in grams */
  weight: number;
  /** Dimensions in cm: [L, W, H] */
  dimensions: [number, number, number];
  inStock: boolean;
  /** India GST HSN code for candles */
  hsnCode: string;
  /** Wax type for transparency */
  waxType: "soy" | "beeswax" | "coconut-soy" | "paraffin-free";
  /** Primary scent family for quiz matching */
  scentFamily: "woody" | "floral" | "oriental" | "fresh" | "spicy" | "citrus";
  /** Ingredients string for label compliance */
  ingredients: string;
  /** Whether the product can be gifted */
  giftEligible: boolean;
}

export const products: Product[] = [
  // ── Signature Collection ───────────────────────────────────────────────
  {
    id: "lum-001",
    name: "Golden Hour",
    tagline: "Warm amber meets sun-kissed vanilla",
    description:
      "Inspired by the last light of a Mediterranean sunset, Golden Hour wraps your space in layers of warm amber, sun-kissed vanilla, and a whisper of sandalwood. Hand-poured with 100% natural soy wax into a reusable hand-blown amber glass vessel.",
    price: 2499,
    slug: "golden-hour",
    category: "signature",
    image: "/golden-hour.png",
    notes: ["Amber", "Vanilla", "Sandalwood"],
    burnTime: 55,
    weight: 280,
    dimensions: [8, 8, 10],
    inStock: true,
    hsnCode: "3406",
    waxType: "soy",
    scentFamily: "oriental",
    ingredients: "Soy wax, fragrance oil (phthalate-free), cotton wick, amber glass vessel",
    giftEligible: true,
  },
  {
    id: "lum-002",
    name: "Midnight Oud",
    tagline: "Deep oud softened with rose petals",
    description:
      "A bold, intoxicating blend of rare oud, dark rose, and smoky vetiver. Midnight Oud transforms any room into an opulent sanctuary. Encased in a matte-black ceramic vessel, hand-finished by artisans in Lucknow.",
    price: 3499,
    slug: "midnight-oud",
    category: "signature",
    image: "/midnight-oud.png",
    notes: ["Oud", "Rose", "Vetiver"],
    burnTime: 60,
    weight: 320,
    dimensions: [9, 9, 11],
    inStock: true,
    hsnCode: "3406",
    waxType: "coconut-soy",
    scentFamily: "oriental",
    ingredients: "Coconut-soy blend wax, oud fragrance oil, rose absolute, cotton wick, ceramic vessel",
    giftEligible: true,
  },
  {
    id: "lum-003",
    name: "Cedarwood Bliss",
    tagline: "Forest warmth in every flicker",
    description:
      "Close your eyes and breathe in the quiet warmth of a cedar cabin at dusk. Grounded with patchouli and lifted by bergamot, this candle is serenity in a jar. Poured into a frosted glass vessel with a natural linen label.",
    price: 1999,
    slug: "cedarwood-bliss",
    category: "signature",
    image: "/cedarwood-bliss.png",
    notes: ["Cedarwood", "Patchouli", "Bergamot"],
    burnTime: 50,
    weight: 260,
    dimensions: [7.5, 7.5, 9.5],
    inStock: true,
    hsnCode: "3406",
    waxType: "soy",
    scentFamily: "woody",
    ingredients: "Soy wax, cedarwood essential oil, bergamot oil, patchouli oil, cotton wick, frosted glass vessel",
    giftEligible: true,
  },
  {
    id: "lum-004",
    name: "Velvet Rose",
    tagline: "Lush Damascena rose layered with silk",
    description:
      "An ode to timeless elegance, Velvet Rose balances Damascena rose absolute with silky iris butter and a warm cashmere base. The perfect gift for someone unforgettable — beautifully packaged in our signature blush gift box.",
    price: 2999,
    slug: "velvet-rose",
    category: "signature",
    image: "/velvet-rose.png",
    notes: ["Rose", "Iris", "Cashmere Wood"],
    burnTime: 50,
    weight: 280,
    dimensions: [8, 8, 10],
    inStock: true,
    hsnCode: "3406",
    waxType: "beeswax",
    scentFamily: "floral",
    ingredients: "Beeswax, rose absolute, iris butter, cashmere fragrance oil, cotton wick, rose-gold glass vessel",
    giftEligible: true,
  },
  {
    id: "lum-005",
    name: "Sea Salt & Driftwood",
    tagline: "Coastal calm with every breath",
    description:
      "Bring the serenity of an empty beach into your home. Sea salt, weathered driftwood, and a trace of white musk create a scent that's both refreshing and deeply grounding. Perfect for meditation or winding down after work.",
    price: 2299,
    slug: "sea-salt-driftwood",
    category: "signature",
    image: "/sea-salt-driftwood.png",
    notes: ["Sea Salt", "Driftwood", "White Musk"],
    burnTime: 52,
    weight: 270,
    dimensions: [8, 8, 10],
    inStock: true,
    hsnCode: "3406",
    waxType: "soy",
    scentFamily: "fresh",
    ingredients: "Soy wax, sea mineral fragrance, driftwood accord, white musk, cotton wick, clear glass vessel",
    giftEligible: true,
  },
  {
    id: "lum-006",
    name: "Bergamot & Thyme",
    tagline: "Mediterranean herb garden, bottled",
    description:
      "Zesty bergamot and aromatic thyme meet on a clean linen base — this candle feels like an afternoon in a sun-drenched Provençal kitchen. Light and effortlessly sophisticated for everyday use.",
    price: 1799,
    slug: "bergamot-thyme",
    category: "signature",
    image: "/bergamot-thyme.png",
    notes: ["Bergamot", "Thyme", "Linen"],
    burnTime: 48,
    weight: 240,
    dimensions: [7, 7, 9],
    inStock: true,
    hsnCode: "3406",
    waxType: "soy",
    scentFamily: "fresh",
    ingredients: "Soy wax, bergamot essential oil, thyme oil, linen accord, cotton wick, clear glass vessel",
    giftEligible: false,
  },
  // ── Seasonal Collection ────────────────────────────────────────────────
  {
    id: "lum-007",
    name: "Winter Spice",
    tagline: "Cinnamon, clove & holiday magic",
    description:
      "A seasonal favourite returning by popular demand. Winter Spice mingles cinnamon bark, crushed clove, and candied orange peel with a base of creamy tonka bean. It's the scent of family, festivity, and falling snow.",
    price: 2799,
    slug: "winter-spice",
    category: "seasonal",
    image: "/winter-spice.png",
    notes: ["Cinnamon", "Clove", "Tonka Bean"],
    burnTime: 45,
    weight: 250,
    dimensions: [7.5, 7.5, 9.5],
    inStock: true,
    hsnCode: "3406",
    waxType: "coconut-soy",
    scentFamily: "spicy",
    ingredients: "Coconut-soy wax, cinnamon bark oil, clove absolute, tonka bean, orange peel, cotton wick, terracotta vessel",
    giftEligible: true,
  },
  {
    id: "lum-008",
    name: "Monsoon Earth",
    tagline: "Petrichor, vetiver & wet soil",
    description:
      "Inspired by the first rains of the Indian monsoon — that unmistakable scent of earth revived. Petrichor, smoky vetiver, and green leaves transport you to the moment the sky breaks open in June.",
    price: 2199,
    slug: "monsoon-earth",
    category: "seasonal",
    image: "/monsoon-earth.png",
    notes: ["Petrichor", "Vetiver", "Green Leaves"],
    burnTime: 50,
    weight: 265,
    dimensions: [8, 8, 10],
    inStock: true,
    hsnCode: "3406",
    waxType: "soy",
    scentFamily: "woody",
    ingredients: "Soy wax, petrichor accord, vetiver essential oil, green leaf extract, cotton wick, earthenware vessel",
    giftEligible: true,
  },
  {
    id: "lum-009",
    name: "Diwali Nights",
    tagline: "Marigold, saffron & warm diyas",
    description:
      "A celebration in a jar. Golden marigold, saffron, and a hint of warm ghee recall the golden glow of a thousand diyas. Limited seasonal edition — crafted each year in small batches for the festive season.",
    price: 3299,
    slug: "diwali-nights",
    category: "seasonal",
    image: "/diwali-nights.png",
    notes: ["Marigold", "Saffron", "Sandalwood"],
    burnTime: 55,
    weight: 300,
    dimensions: [9, 9, 11],
    inStock: true,
    hsnCode: "3406",
    waxType: "beeswax",
    scentFamily: "oriental",
    ingredients: "Beeswax, marigold absolute, saffron extract, sandalwood oil, cotton wick, gold-painted ceramic vessel",
    giftEligible: true,
  },
  // ── Limited Collection ─────────────────────────────────────────────────
  {
    id: "lum-010",
    name: "Jasmine Noir",
    tagline: "Night-blooming jasmine & musk",
    description:
      "Captured under a moonlit sky, Jasmine Noir intertwines night-blooming jasmine with white musk and a trace of black pepper. Limited edition — each batch is individually numbered. Once it's gone, it's gone.",
    price: 3999,
    slug: "jasmine-noir",
    category: "limited",
    image: "/jasmine-noir.png",
    notes: ["Jasmine", "White Musk", "Black Pepper"],
    burnTime: 55,
    weight: 300,
    dimensions: [9, 9, 11],
    inStock: true,
    hsnCode: "3406",
    waxType: "coconut-soy",
    scentFamily: "floral",
    ingredients: "Coconut-soy wax, jasmine sambac absolute, white musk, black pepper CO2, cotton wick, obsidian glass vessel",
    giftEligible: true,
  },
  {
    id: "lum-011",
    name: "Amber & Cognac",
    tagline: "A fireside sip in every flame",
    description:
      "Reserved for evenings when only something extraordinary will do. Aged amber resin, a hint of cognac, and dark labdanum create a sophisticated, slightly intoxicating fusion. Only 200 units per year.",
    price: 4999,
    slug: "amber-cognac",
    category: "limited",
    image: "/amber-cognac.png",
    notes: ["Amber Resin", "Cognac", "Labdanum"],
    burnTime: 65,
    weight: 360,
    dimensions: [10, 10, 12],
    inStock: true,
    hsnCode: "3406",
    waxType: "beeswax",
    scentFamily: "oriental",
    ingredients: "Beeswax, amber resin absolute, cognac accord, labdanum, cotton wick, crystal vessel with gold lid",
    giftEligible: true,
  },
  {
    id: "lum-012",
    name: "Hinoki Forest",
    tagline: "Japanese cypress & morning mist",
    description:
      "Hinoki wood — the scent of ancient Japanese temples and pristine mountain forests. Crisp cypress, cool mineral, and soft cedarwood create a meditative stillness. Each vessel is hand-stamped with the kanji for 'serenity'.",
    price: 3799,
    slug: "hinoki-forest",
    category: "limited",
    image: "/hinoki-forest.png",
    notes: ["Hinoki Cypress", "Cedar", "Stone Mineral"],
    burnTime: 58,
    weight: 310,
    dimensions: [9, 9, 11],
    inStock: false,
    hsnCode: "3406",
    waxType: "soy",
    scentFamily: "woody",
    ingredients: "Soy wax, hinoki essential oil, cedarwood oil, mineral accord, cotton wick, white ceramic vessel",
    giftEligible: true,
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

/** Returns all products in a given category. */
export function getProductsByCategory(category: Product["category"]): Product[] {
  return products.filter((p) => p.category === category);
}

/** Returns products matching a scent family (for quiz integration). */
export function getProductsByScentFamily(family: Product["scentFamily"]): Product[] {
  return products.filter((p) => p.scentFamily === family && p.inStock);
}


