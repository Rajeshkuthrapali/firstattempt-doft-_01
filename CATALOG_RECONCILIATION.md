# Catalog Import Reconciliation Report

**Generated:** 2026-06-15
**Database:** doft_candles (PostgreSQL)

---

## Summary

| Metric | Value |
|--------|-------|
| CSV products expected | **40** |
| Database products found | **51** (11 seed + 40 CSV imported) |
| Status | ✅ **PASS** — All CSV products imported successfully |

---

## Breakdown

### Products

| Status | Count |
|--------|-------|
| Expected from CSV | 40 |
| Found in database | 51 |
| — Seed (pre-existing) | 11 |
| — CSV Imported | 40 |
| Missing | 0 |
| With variants | 51 (100%) |
| With collections | 51 (100%) |
| With categories | 51 (100%) |
| With images | 11 (all seed; 0 CSV — CSV has no image data) |

### Variants

| Status | Count |
|--------|-------|
| Total variants | 65 |
| Products with variants | 51 (100%) |
| Variants per product | Range: 1–3 (seed: 2–3 each, CSV: 1 each) |

### Collections

| Name | Slug | Product Count |
|------|------|---------------|
| Artisan Collection | `artisan-collection` | 40 |
| Beeswax Collection | `beeswax-collection` | 3 |
| Gift Collection | `gift-collection` | 16 |
| Gift Sets | `gift-sets` | 2 |
| Scented Collection | `scented-collection` | 6 |
| Seasonal | `seasonal` | 4 |
| Signature Collection | `signature-collection` | 5 |

### Categories

| Name | Slug | Product Count |
|------|------|---------------|
| Beeswax | `beeswax` | 3 |
| Bubble / Sphere | `bubble-sphere` | 3 |
| Citrus | `citrus` | 2 |
| Floral | `floral` | 2 |
| Fresh | `fresh` | 2 |
| Gourmand | `gourmand` | 3 |
| Jar / Container | `jar-container` | 6 |
| Novelty / Shaped | `novelty-shaped` | 15 |
| Pillar / Column | `pillar-column` | 9 |
| Ribbed / Fluted | `ribbed-fluted` | 7 |
| Tealights / Small | `tealights-small` | 6 |
| Woody | `woody` | 2 |

---

## Issues Found

1. **8 products had no categories assigned** — The CSV import script's keyword-based categorization rules lacked keywords for products like "Sun n Moon Face", "King Lion", "Baby Bud Candle", "Baby Swirl", "Baby Teddy Candle", "Pearl Small Candle", "Boho Arch Candle", and "Ladoo Scented Candle". These products were imported without any `product_categories` rows.
2. **40 CSV products have no images** — The source CSV (`Choco_Crust_Candle_Catalogue.csv`) does not contain image URLs or filenames. The import script defaults to an empty `images[]` array. This is a data source limitation.
3. **All CSV products have `fragrance_family = "Unknown"`** — The CSV does not include fragrance family data; the import script hardcodes this value.
4. **No descriptions or taglines** for CSV products — The CSV only provides Code, Product, MOQ, Weight, Size, and Price_INR columns.

---

## Fixes Applied

1. ✅ **Updated category keyword rules** in `server/prisma/csv-import.ts`:
   - Added keywords to **Novelty / Shaped**: `ladoo`, `moon`, `face`, `lion`, `king`, `bud`, `swirl`, `pearl`, `teddy`, `boho`, `3d`, `valentine`
   - Added keywords to **Pillar / Column**: `arch`, `roman`, `greek`
   - Added `small` to **Tealights / Small** pattern
   - Re-ran the import (all 40 products updated via `upsert`; products with existing categories were unaffected)

2. ✅ **Verified all 8 previously uncategorized products now have categories:**

| Product | Assigned Categories |
|---------|-------------------|
| Ladoo Scented Candle | Novelty / Shaped |
| Boho Arch Candle | Pillar / Column, Novelty / Shaped |
| Sun n Moon Face | Novelty / Shaped |
| King Lion | Novelty / Shaped |
| Baby Bud Candle | Novelty / Shaped |
| Baby Swirl | Novelty / Shaped |
| Pearl Small Candle | Tealights / Small, Novelty / Shaped |
| Baby Teddy Candle | Novelty / Shaped |

---

## Remaining Gaps

1. **40 CSV products lack images** — Either upload product images and add URLs via database update, or add image fields to the CSV format and re-import.
2. **All CSV products have `fragrance_family = "Unknown"`** — Add fragrance family data to the CSV (column) or map based on product name/category.
3. **All CSV products lack descriptions and taglines** — These need to be authored individually or generated programmatically.

---

## Current Database State Summary

| Entity | Count |
|--------|-------|
| Products | **51** (11 seed + 40 CSV) |
| Variants | **65** |
| Collections | **7** |
| Categories | **12** |
| Product-Category links | **60** |
| Product-Collection links | **76** |
| Products with images | **11** (all seed) |
| Products with variants | **51 (100%)** |
| Products with collections | **51 (100%)** |
| Products with categories | **51 (100%)** |

**Overall: ✅ All 40 CSV products imported. All relationships (variants, collections, categories) are fully populated.**
