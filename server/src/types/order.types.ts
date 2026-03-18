import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared address schema
// ---------------------------------------------------------------------------

export const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(5).max(10),
  country: z.string().default("IN"),
  phone: z.string().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ---------------------------------------------------------------------------
// Cart item for order creation
// ---------------------------------------------------------------------------

export const orderLineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(50),
});

export type OrderLineInput = z.infer<typeof orderLineSchema>;

// ---------------------------------------------------------------------------
// Create order request
// ---------------------------------------------------------------------------

export const createOrderSchema = z.object({
  items: z.array(orderLineSchema).min(1),
  promoCode: z.string().optional(),
  guestEmail: z.string().email().optional(),
  giftMessage: z.string().max(500).optional(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  gateway: z.enum(["RAZORPAY", "STRIPE"]).default("RAZORPAY"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ---------------------------------------------------------------------------
// Verify payment request (Razorpay client-side callback)
// ---------------------------------------------------------------------------

export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

// ---------------------------------------------------------------------------
// Order response DTO
// ---------------------------------------------------------------------------

export interface OrderResponse {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  items: Array<{
    variantId: string;
    quantity: number;
    priceCents: number;
  }>;
  payment: {
    gateway: string;
    gatewayOrderId: string | null;
    status: string;
  } | null;
  createdAt: Date;
}
