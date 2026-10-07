import express from "express";
import {
  getStockTransactions,
  createStockTransaction,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
} from "../controllers/inventory.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/stock-transactions", authenticate, getStockTransactions);
router.post("/stock-transactions", authenticate, createStockTransaction);
router.get("/transactions", authenticate, getStockTransactions);
router.post("/transactions", authenticate, createStockTransaction);

router.get("/purchase-orders", authenticate, getPurchaseOrders);
router.post("/purchase-orders", authenticate, authorize("OWNER", "MANAGER"), createPurchaseOrder);
router.patch("/purchase-orders/:id/status", authenticate, authorize("OWNER", "MANAGER"), updatePurchaseOrderStatus);

export default router;
