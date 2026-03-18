import type { Request, Response, NextFunction } from "express";
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

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    if (err instanceof OrderError) {
      res.status(err.statusCode).json({ success: false, error: err.message });
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

    res.json({ success: true, data: order });
  } catch (err) {
    if (err instanceof OrderError) {
      res.status(err.statusCode).json({ success: false, error: err.message });
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

    res.json({
      success: true,
      data: result.orders,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (err) {
    if (err instanceof OrderError) {
      res.status(err.statusCode).json({ success: false, error: err.message });
      return;
    }
    next(err);
  }
}
