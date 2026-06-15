import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { doubleCsrf } from "csrf-csrf";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { securityLogger } from "./services/security-logger.js";
import healthRoutes from "./routes/health.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import authRoutes from "./routes/auth.routes.js";
import marketingRoutes from "./routes/marketing.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";

const app = express();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

// Security headers — CSP + standard Helmet protections
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'"], // for Tailwind/shadcn
        imgSrc: ["'self'", "https:", "data:"],    // for Cloudinary images + inline SVGs
        connectSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://api.stripe.com",
          "https://checkout.razorpay.com",
        ],
        fontSrc: ["'self'", "https:", "data:"],
        frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

// CORS — allow frontend origin
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
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
  handler: (req, _res, next) => {
    securityLogger.warn("rate_limit_breach", {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    next();
  },
});
app.use("/api/", limiter);

// Raw body parser for webhook routes (must come BEFORE global express.json())
app.use("/api/payments/webhooks", express.raw({ type: "application/json" }));

// JSON body parser (applied to all non-webhook routes)
app.use(express.json({ limit: "10kb" }));

// ---------------------------------------------------------------------------
// CSRF protection — double-submit cookie pattern
// ---------------------------------------------------------------------------

const {
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  getSessionIdentifier: (req) => req.ip ?? req.socket.remoteAddress ?? "unknown",
  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

// Expose CSRF token via a GET endpoint (must come BEFORE CSRF middleware)
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: generateCsrfToken(req, res) });
});

// Apply CSRF protection to /api/ routes (excluding webhooks)
app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/payments/webhooks") || req.path === "/csrf-token") {
    return next();
  }
  doubleCsrfProtection(req, res, (err) => {
    if (err) {
      securityLogger.warn("csrf_violation", {
        ip: req.ip,
        path: req.originalUrl,
        method: req.method,
        error: err.message,
      });
    }
    next(err);
  });
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/products", catalogRoutes);

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
║  🕯  Lumière — Payment Server                   ║
║  🌐  http://localhost:${PORT}                          ║
║  📊  Environment: ${env.NODE_ENV.padEnd(15)}              ║
║  💳  Razorpay: configured                            ║
║  💳  Stripe:   ${env.STRIPE_SECRET_KEY ? "configured" : "not configured (optional)"}       ║
╚══════════════════════════════════════════════════════╝
  `);
});

export default app;
