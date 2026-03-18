import { prisma } from "../lib/prisma.js";
import type { CreateOrderInput, OrderResponse } from "../types/order.types.js";

/**
 * Creates a new order with line items, applies promo code if valid,
 * calculates totals, and returns the persisted order.
 *
 * @param input - Validated order creation input
 * @param userId - Optional authenticated user ID (null for guest checkout)
 * @returns The created order with items
 */
export async function createOrder(
  input: CreateOrderInput,
  userId: string | null,
): Promise<OrderResponse> {
  // 1. Fetch all requested variants in one query
  const variantIds = input.items.map((i) => i.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: variantIds } },
  });

  if (variants.length !== variantIds.length) {
    const found = new Set(variants.map((v) => v.id));
    const missing = variantIds.filter((id) => !found.has(id));
    throw new OrderError(`Variants not found: ${missing.join(", ")}`, 404);
  }

  // 2. Check stock availability
  const variantMap = new Map(variants.map((v) => [v.id, v]));
  for (const line of input.items) {
    const variant = variantMap.get(line.variantId)!;
    if (variant.stock < line.quantity) {
      throw new OrderError(
        `Insufficient stock for SKU ${variant.sku}: requested ${line.quantity}, available ${variant.stock}`,
        409,
      );
    }
  }

  // 3. Calculate subtotal
  let subtotalCents = 0;
  const orderItems = input.items.map((line) => {
    const variant = variantMap.get(line.variantId)!;
    const lineTotalCents = variant.priceCents * line.quantity;
    subtotalCents += lineTotalCents;
    return {
      variantId: line.variantId,
      quantity: line.quantity,
      priceCents: variant.priceCents,
    };
  });

  // 4. Apply promo code (if provided)
  let discountCents = 0;
  let promoId: string | null = null;

  if (input.promoCode) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: input.promoCode.toUpperCase() },
    });

    if (!promo) {
      throw new OrderError(`Invalid promo code: ${input.promoCode}`, 400);
    }

    const now = new Date();
    if (!promo.active || now < promo.startsAt || now > promo.expiresAt) {
      throw new OrderError("Promo code has expired or is inactive", 400);
    }

    if (promo.usageLimit !== null && promo.timesUsed >= promo.usageLimit) {
      throw new OrderError("Promo code usage limit reached", 400);
    }

    if (promo.minOrderCents !== null && subtotalCents < promo.minOrderCents) {
      throw new OrderError(
        `Minimum order of ₹${(promo.minOrderCents / 100).toFixed(2)} required for this promo`,
        400,
      );
    }

    discountCents =
      promo.type === "PERCENTAGE"
        ? Math.round((subtotalCents * promo.value) / 100)
        : promo.value;

    // Never discount more than the subtotal
    discountCents = Math.min(discountCents, subtotalCents);
    promoId = promo.id;
  }

  // 5. Shipping: free above ₹3,000 (300000 paise)
  const FREE_SHIPPING_THRESHOLD = 300000;
  const FLAT_SHIPPING = 9900; // ₹99
  const shippingCents =
    subtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;

  const totalCents = subtotalCents - discountCents + shippingCents;

  // 6. Persist in a transaction: create order + decrement stock + bump promo usage
  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock
    for (const line of input.items) {
      await tx.variant.update({
        where: { id: line.variantId },
        data: { stock: { decrement: line.quantity } },
      });
    }

    // Bump promo usage
    if (promoId) {
      await tx.promoCode.update({
        where: { id: promoId },
        data: { timesUsed: { increment: 1 } },
      });
    }

    // Create order with items
    return tx.order.create({
      data: {
        userId,
        status: "PENDING",
        subtotalCents,
        shippingCents,
        discountCents,
        totalCents,
        currency: "INR",
        promoId,
        guestEmail: input.guestEmail,
        giftMessage: input.giftMessage,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress ?? input.shippingAddress,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });
  });

  return mapOrderToResponse(order);
}

/**
 * Retrieves a single order by ID. Checks ownership for non-admin users.
 *
 * @param orderId - UUID of the order
 * @param userId - Requesting user ID (null for guest)
 * @returns Order response DTO
 */
export async function getOrderById(
  orderId: string,
  userId: string | null,
): Promise<OrderResponse> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });

  if (!order) {
    throw new OrderError("Order not found", 404);
  }

  // Non-admin users can only view their own orders
  if (userId && order.userId && order.userId !== userId) {
    throw new OrderError("Forbidden", 403);
  }

  return mapOrderToResponse(order);
}

/**
 * Lists orders for a given user, paginated.
 *
 * @param userId - The user whose orders to list
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 */
export async function listUserOrders(
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ orders: OrderResponse[]; total: number }> {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders: orders.map(mapOrderToResponse),
    total,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Maps a Prisma order to the API response shape. */
function mapOrderToResponse(order: {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: Date;
  items: Array<{ variantId: string; quantity: number; priceCents: number }>;
  payment: {
    gateway: string;
    gatewayOrderId: string | null;
    status: string;
  } | null;
}): OrderResponse {
  return {
    id: order.id,
    status: order.status,
    totalCents: order.totalCents,
    currency: order.currency,
    items: order.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      priceCents: item.priceCents,
    })),
    payment: order.payment
      ? {
          gateway: order.payment.gateway,
          gatewayOrderId: order.payment.gatewayOrderId,
          status: order.payment.status,
        }
      : null,
    createdAt: order.createdAt,
  };
}

/**
 * Domain error with associated HTTP status code.
 */
export class OrderError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "OrderError";
  }
}
