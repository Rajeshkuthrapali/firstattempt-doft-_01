import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/health.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

// Security headers
app.use(helmet());

// CORS — allow frontend origin
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Request logging
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
}

// Rate limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please try again later",
  },
});
app.use("/api/", limiter);

// JSON body parser (applied to non-webhook routes)
app.use(
  express.json({
    limit: "10kb",
    // Skip JSON parsing for webhook routes — they need raw body
    verify: (_req, _res, buf) => {
      // Store raw body for webhook signature verification
      (_req as typeof _req & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use("/api/health", healthRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

app.use(errorHandler);

// ---------------------------------------------------------------------------
// Server startup
// ---------------------------------------------------------------------------

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║  🕯  DOFT Candles — Payment Server                   ║
║  🌐  http://localhost:${PORT}                          ║
║  📊  Environment: ${env.NODE_ENV.padEnd(15)}              ║
║  💳  Razorpay: configured                            ║
║  💳  Stripe:   ${env.STRIPE_SECRET_KEY ? "configured" : "not configured (optional)"}       ║
╚══════════════════════════════════════════════════════╝
  `);
});

export default app;
