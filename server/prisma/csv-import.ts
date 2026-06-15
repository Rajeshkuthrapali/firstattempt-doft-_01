import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

const CSV_PATH = "/home/mb/Downloads/Choco_Crust_Candle_Catalogue.csv";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CsvRow {
  code: string;
  product: string;
  moq: string;
  weight: string;
  size: string;
  priceInr: string;
}

// ---------------------------------------------------------------------------
// CSV Parsing (handles quoted fields)
// ---------------------------------------------------------------------------

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseCsv(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < headers.length) continue;

    rows.push({
      code: values[0]?.trim() ?? "",
      product: values[1]?.trim() ?? "",
      moq: values[2]?.trim() ?? "",
      weight: values[3]?.trim() ?? "",
      size: values[4]?.trim() ?? "",
      priceInr: values[5]?.trim() ?? "",
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Data normalization helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Extract the minimum price from a price string.
 * Handles: "70", "40 (75 set of 2)", "150 onwards", "400-450", "260 onwards"
 */
function extractMinPrice(priceStr: string): number {
  // Range pattern: "400-450" → 400
  const rangeMatch = priceStr.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    return parseInt(rangeMatch[1], 10);
  }

  // First number in string
  const firstNumMatch = priceStr.match(/(\d+)/);
  if (firstNumMatch) {
    return parseInt(firstNumMatch[1], 10);
  }

  return 0;
}

/**
 * Parse weight string (grams or ml) into a numeric value.
 * Returns null for ambiguous values like "40ml/60ml/200ml".
 */
function parseWeight(weightStr: string): number | null {
  if (!weightStr) return null;

  // Multiple options like "40ml/60ml/200ml" — cannot pick one
  if (weightStr.includes("/")) return null;

  const match = weightStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

// ---------------------------------------------------------------------------
// Categorization logic (based on product name keywords)
// ---------------------------------------------------------------------------

const CATEGORY_RULES: { name: string; pattern: RegExp }[] = [
  { name: "Beeswax", pattern: /\b(beeswax|honey)\b/i },
  { name: "Tealights / Small", pattern: /\b(tealight|mini|small)\b/i },
  { name: "Ribbed / Fluted", pattern: /\b(ribbed|fluted)\b/i },
  { name: "Jar / Container", pattern: /\b(jar|tin|container)\b/i },
  { name: "Bubble / Sphere", pattern: /\b(bubble|sphere)\b/i },
  { name: "Pillar / Column", pattern: /\b(pillar|column|cylinder|taper|dinner|arch|roman|greek)\b/i },
  { name: "Novelty / Shaped", pattern: /\b(peony|rose|flower|daisy|sunflower|star|heart|cloud|seashell|ball|egg|pineapple|fruit|ladoo|moon|face|lion|king|bud|swirl|pearl|teddy|boho|3d|valentine)\b/i },
];

function determineCategories(productName: string): string[] {
  const matched: string[] = [];
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(productName)) {
      matched.push(rule.name);
    }
  }
  return matched;
}

function isScented(productName: string): boolean {
  return /scent|fragrance/i.test(productName);
}

function isBeeswax(productName: string): boolean {
  return /beeswax/i.test(productName);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("═══ CSV Product Import ═══\n");

  // --- Validate CSV ---
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV file not found at: ${CSV_PATH}`);
    process.exit(1);
  }

  // --- Parse CSV ---
  const rows = parseCsv(CSV_PATH);
  console.log(`📄 Read ${rows.length} rows from CSV\n`);

  // --- Create / Get Categories ---
  const CATEGORY_NAMES = [
    "Beeswax",
    "Tealights / Small",
    "Ribbed / Fluted",
    "Jar / Container",
    "Bubble / Sphere",
    "Pillar / Column",
    "Novelty / Shaped",
  ];

  const categoryMap = new Map<string, string>();
  for (const name of CATEGORY_NAMES) {
    const slug = slugify(name);
    const cat = await prisma.category.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
    categoryMap.set(name, cat.id);
    console.log(`  📁 Category "${name}" (${slug})`);
  }
  console.log();

  // --- Create / Get Collections ---
  const COLLECTIONS = [
    { title: "Artisan Collection", slug: "artisan-collection", description: "Handcrafted artisan candles from our workshop." },
    { title: "Scented Collection", slug: "scented-collection", description: "Beautifully scented candles for every mood." },
    { title: "Beeswax Collection", slug: "beeswax-collection", description: "Natural beeswax candles for a warm, natural glow." },
    { title: "Gift Collection", slug: "gift-collection", description: "Affordable candles perfect for gifting." },
  ];

  const collectionMap = new Map<string, string>();
  for (const col of COLLECTIONS) {
    const c = await prisma.collection.upsert({
      where: { slug: col.slug },
      create: col,
      update: {},
    });
    collectionMap.set(col.title, c.id);
    console.log(`  📚 Collection "${col.title}" (${col.slug})`);
  }
  console.log();

  // --- Track used slugs to handle duplicates ---
  const usedSlugs = new Map<string, number>();

  // --- Import each product ---
  let createdCount = 0;
  let updatedCount = 0;

  for (const row of rows) {
    // Generate unique slug
    let slug = slugify(row.product);
    if (slug.length === 0) {
      slug = `product-${row.code.toLowerCase()}`;
    }
    if (usedSlugs.has(slug)) {
      const count = usedSlugs.get(slug)! + 1;
      usedSlugs.set(slug, count);
      slug = `${slug}-${count}`;
    } else {
      usedSlugs.set(slug, 1);
    }

    const priceCents = extractMinPrice(row.priceInr);
    const weight = parseWeight(row.weight);
    const categoryNames = determineCategories(row.product);
    const scented = isScented(row.product);
    const beeswax = isBeeswax(row.product);

    // Determine collections
    const productCollectionNames: string[] = ["Artisan Collection"];
    if (scented) productCollectionNames.push("Scented Collection");
    if (beeswax) productCollectionNames.push("Beeswax Collection");
    if (priceCents < 100) productCollectionNames.push("Gift Collection");

    // Upsert product
    const product = await prisma.product.upsert({
      where: { slug },
      create: {
        title: row.product,
        slug,
        description: null,
        tagline: "",
        scentNotes: [],
        burnTime: null,
        weight,
        hsnCode: "34060010",
        waxType: "Paraffin Wax",
        ingredients: null,
        giftEligible: true,
        images: [],
        fragranceFamily: "Unknown",
      },
      update: {
        title: row.product,
        weight,
        giftEligible: true,
        hsnCode: "34060010",
        waxType: "Paraffin Wax",
        fragranceFamily: "Unknown",
      },
    });

    // Upsert variant (one per product, default variant)
    const sku = row.code; // e.g. "B1", "B2", ...
    await prisma.variant.upsert({
      where: { sku },
      create: {
        productId: product.id,
        size: row.size || null,
        priceCents,
        stock: 100,
        sku,
      },
      update: {
        productId: product.id,
        size: row.size || null,
        priceCents,
        stock: 100,
      },
    });

    // Refresh links: delete existing then re-create
    await prisma.productCategory.deleteMany({ where: { productId: product.id } });
    await prisma.productCollection.deleteMany({ where: { productId: product.id } });

    // Link categories
    for (const catName of categoryNames) {
      const catId = categoryMap.get(catName);
      if (catId) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId: catId },
        });
      }
    }

    // Link collections
    for (const colName of productCollectionNames) {
      const colId = collectionMap.get(colName);
      if (colId) {
        await prisma.productCollection.create({
          data: { productId: product.id, collectionId: colId },
        });
      }
    }

    const catLabel = categoryNames.length > 0 ? categoryNames.join(", ") : "(none)";
    console.log(`  ${row.code.padEnd(4)} ${slug.padEnd(32)} ₹${String(priceCents).padEnd(4)} [${catLabel}]`);
    createdCount++;
  }

  // --- Summary ---
  console.log("\n═══ Import Summary ═══");
  console.log(`  Rows processed:  ${createdCount}`);
  console.log(`  Products:        ${await prisma.product.count()}`);
  console.log(`  Variants:        ${await prisma.variant.count()}`);
  console.log(`  Collections:     ${await prisma.collection.count()}`);
  console.log(`  Categories:      ${await prisma.category.count()}`);
  console.log(`  Prod-Categories: ${await prisma.productCategory.count()}`);
  console.log(`  Prod-Collections:${await prisma.productCollection.count()}`);
  console.log("\n✅ Import complete!");
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
