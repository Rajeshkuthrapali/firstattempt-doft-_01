import { Router } from "express";

const router = Router();

/**
 * GET /api/health
 * Simple health-check endpoint for monitoring and load balancers.
 */
router.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;
