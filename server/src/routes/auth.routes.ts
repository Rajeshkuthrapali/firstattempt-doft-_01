import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  handleRegister,
  handleLogin,
  handleRefresh,
  handleLogout,
  handleMe,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ---------------------------------------------------------------------------
// Rate limiters for auth endpoints
// ---------------------------------------------------------------------------

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 attempts per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many attempts, please try again later",
  },
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.post("/register", authLimiter, handleRegister);
router.post("/login", authLimiter, handleLogin);
router.post("/refresh", handleRefresh);
router.post("/logout", handleLogout);
router.get("/me", requireAuth, handleMe);

export default router;
