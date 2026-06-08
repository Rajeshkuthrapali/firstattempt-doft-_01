import { Router } from "express";
import {
  handleListProducts,
  handleGetProduct,
  handleSearchProducts,
  handleFeaturedProducts,
} from "../controllers/catalog.controller.js";

const router = Router();

// Order matters: specific routes before parameterized ones
router.get("/search", handleSearchProducts);
router.get("/featured", handleFeaturedProducts);
router.get("/", handleListProducts);
router.get("/:slug", handleGetProduct);

export default router;
