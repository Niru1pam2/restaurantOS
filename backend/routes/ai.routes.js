import express from "express";
import {
  predictShortages,
  getReorderRecommendations,
  suggestMenuPricing,
  estimatePrepTime,
  analyzeWaste,
} from "../controllers/ai.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/predict-shortages", authenticate, predictShortages);
router.get("/reorder-recommendations", authenticate, getReorderRecommendations);
router.post("/suggest-pricing", authenticate, suggestMenuPricing);
router.get("/estimate-prep-time", authenticate, estimatePrepTime);
router.get("/waste-analysis", authenticate, analyzeWaste);

export default router;
