import Stripe from "stripe";
import { env } from "../config/env.js";

/**
 * Optional Stripe SDK instance.
 * Only initialised when `STRIPE_SECRET_KEY` is present in environment.
 */
export const stripeClient: Stripe | null = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" })
  : null;
