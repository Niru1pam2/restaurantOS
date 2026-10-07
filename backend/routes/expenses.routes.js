import express from "express";
import {
  getExpenseCategories,
  createExpenseCategory,
  getExpenses,
  createExpense,
  deleteExpense,
} from "../controllers/expenses.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/categories", authenticate, getExpenseCategories);
router.post("/categories", authenticate, authorize("OWNER", "MANAGER"), createExpenseCategory);

router.get("/", authenticate, getExpenses);
router.post("/", authenticate, authorize("OWNER", "MANAGER"), createExpense);
router.delete("/:id", authenticate, authorize("OWNER", "MANAGER"), deleteExpense);

export default router;
