import express from "express";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../controllers/ingredients.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getIngredients);
router.post("/", authenticate, authorize("OWNER", "MANAGER", "CHEF"), createIngredient);
router.put("/:id", authenticate, authorize("OWNER", "MANAGER", "CHEF"), updateIngredient);
router.delete("/:id", authenticate, authorize("OWNER", "MANAGER"), deleteIngredient);

export default router;
