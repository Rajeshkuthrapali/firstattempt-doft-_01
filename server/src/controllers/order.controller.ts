import type { Request, Response, NextFunction } from "express";
import { sendSuccess, sendPaginated, sendError } from "../lib/response.js";
import {
  createOrder,
  getOrderById,
  listUserOrders,
  OrderError,
} from "../services/order.service.js";
import type { CreateOrderInput } from "../types/order.types.js";

/**
 * POST /api/orders — Create a new order.
 */
export async function handleCreateOrder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as CreateOrderInput;
    const userId = req.user?.userId ?? null;

    const order = await createOrder(input, userId);

    sendSuccess(res, order, 201);
  } catch (err) {
    if (err instanceof OrderError) {
      sendError(res, err.message, err.statusCode);
      return;
    }
    next(err);
  }
}

/**
 * GET /api/orders/:id — Get a single order.
 */
export async function handleGetOrder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId ?? null;
    const orderId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const order = await getOrderById(orderId, userId);

    sendSuccess(res, order);
  } catch (err) {
    if (err instanceof OrderError) {
      sendError(res, err.message, err.statusCode);
      return;
    }
    next(err);
  }
}

/**
 * GET /api/orders — List orders for authenticated user.
 */
export async function handleListOrders(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const result = await listUserOrders(userId, page, limit);

    sendPaginated(res, result.orders, { page, limit, total: result.total });
  } catch (err) {
    if (err instanceof OrderError) {
      sendError(res, err.message, err.statusCode);
      return;
    }
    next(err);
  }
}
