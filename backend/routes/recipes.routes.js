import express from "express";
import {
  getRecipes,
  addRecipeItem,
  deleteRecipeItem,
} from "../controllers/recipes.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getRecipes);
router.post("/", authenticate, authorize("OWNER", "MANAGER", "CHEF"), addRecipeItem);
router.delete("/:id", authenticate, authorize("OWNER", "MANAGER", "CHEF"), deleteRecipeItem);

export default router;
