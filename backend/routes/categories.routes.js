import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getCategories);
router.post("/", authenticate, authorize("OWNER", "MANAGER"), createCategory);
router.put("/:id", authenticate, authorize("OWNER", "MANAGER"), updateCategory);
router.delete("/:id", authenticate, authorize("OWNER", "MANAGER"), deleteCategory);

export default router;
