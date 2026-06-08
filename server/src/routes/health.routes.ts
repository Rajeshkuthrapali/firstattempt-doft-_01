import { Router } from "express";
import { sendSuccess } from "../lib/response.js";

const router = Router();

/**
 * GET /api/health
 * Simple health-check endpoint for monitoring and load balancers.
 */
router.get("/", (_req, res) => {
  sendSuccess(res, {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
