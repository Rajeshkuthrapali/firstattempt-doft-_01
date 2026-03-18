import { Router } from "express";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createOrderSchema } from "../types/order.types.js";
import {
  handleCreateOrder,
  handleGetOrder,
  handleListOrders,
} from "../controllers/order.controller.js";

const router = Router();

/**
 * POST /api/orders
 * Create a new order. Supports guest checkout (optionalAuth).
 */
router.post("/", optionalAuth, validate(createOrderSchema), handleCreateOrder);

/**
 * GET /api/orders/:id
 * Retrieve a single order by ID.
 */
router.get("/:id", optionalAuth, handleGetOrder);

/**
 * GET /api/orders
 * List orders for the authenticated user (paginated).
 */
router.get("/", requireAuth, handleListOrders);

export default router;
