import type { Request, Response, NextFunction } from "express";
import {
  listProducts,
  getProductBySlug,
  searchProducts,
  getFeaturedProducts,
} from "../services/catalog.service.js";
import {
  GetProductsSchema,
  SearchProductsSchema,
} from "../types/catalog.types.js";
import { sendSuccess, sendError, sendPaginated } from "../lib/response.js";

/**
 * GET /api/products — List products with optional filtering.
 */
export async function handleListProducts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = GetProductsSchema.safeParse(req.query);
    if (!parsed.success) {
      sendError(res, "Invalid query parameters", 400,
        parsed.error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      );
      return;
    }

    const result = await listProducts(parsed.data);
    sendPaginated(res, result.products, {
      page: parsed.data.page,
      limit: parsed.data.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:slug — Get a single product by slug.
 */
export async function handleGetProduct(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const slug = Array.isArray(req.params.slug)
      ? req.params.slug[0]
      : req.params.slug;

    const product = await getProductBySlug(slug);
    if (!product) {
      sendError(res, "Product not found", 404);
      return;
    }

    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/search — Search products by text query.
 */
export async function handleSearchProducts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = SearchProductsSchema.safeParse(req.query);
    if (!parsed.success) {
      sendError(res, "Invalid search query", 400,
        parsed.error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      );
      return;
    }

    const result = await searchProducts(parsed.data);
    sendPaginated(res, result.products, {
      page: parsed.data.page,
      limit: parsed.data.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/featured — Featured products for home page.
 */
export async function handleFeaturedProducts(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const products = await getFeaturedProducts();
    sendSuccess(res, products);
  } catch (err) {
    next(err);
  }
}
