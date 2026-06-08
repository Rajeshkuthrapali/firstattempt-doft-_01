import { Router } from "express";
import { optionalAuth, requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { verifyPaymentSchema } from "../types/order.types.js";
import {
  handleInitiatePayment,
  handleVerifyPayment,
  handleRazorpayWebhook,
  handleStripeWebhook,
  handleAdminRefund,
} from "../controllers/payment.controller.js";
import { createRazorpayOrder } from "../services/razorpay.service.js";

const router = Router();

/**
 * POST /api/payments/initiate
 * Initiates a payment for a given order. Body: `{ orderId, gateway? }`
 */
router.post("/initiate", optionalAuth, handleInitiatePayment);

/**
 * POST /api/payments/razorpay/create-order
 * Dedicated endpoint to create a Razorpay order for client-side checkout.
 * Accepts `{ orderId }` and returns Razorpay order details.
 */
router.post("/razorpay/create-order", optionalAuth, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId || typeof orderId !== "string") {
      res.status(400).json({ success: false, error: "orderId is required" });
      return;
    }
    const result = await createRazorpayOrder(orderId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/verify
 * Client-side callback: verifies Razorpay payment signature.
 */
router.post(
  "/verify",
  optionalAuth,
  validate(verifyPaymentSchema),
  handleVerifyPayment,
);

/**
 * POST /api/webhooks/razorpay
 * Razorpay server-to-server webhook (raw body from global express.raw() middleware).
 */
router.post("/webhooks/razorpay", handleRazorpayWebhook);

/**
 * POST /api/webhooks/stripe
 * Stripe server-to-server webhook (raw body from global express.raw() middleware).
 */
router.post("/webhooks/stripe", handleStripeWebhook);

/**
 * POST /api/payments/admin/refund
 * Admin-only: initiates a Stripe refund for a given PaymentIntent.
 */
router.post("/admin/refund", requireAuth, requireAdmin, handleAdminRefund);

export default router;
