import Razorpay from "razorpay";
import { env } from "../config/env.js";

/**
 * Singleton Razorpay SDK instance.
 * Authenticated with key_id / key_secret from environment.
 */
export const razorpayClient = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});
