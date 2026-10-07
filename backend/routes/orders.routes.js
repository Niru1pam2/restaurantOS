import express from "express";
import {
  getOrders,
  createOrder,
  updateOrderStatus,
  completePayment,
} from "../controllers/orders.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getOrders);
router.post("/", authenticate, createOrder);
router.patch("/:id/status", authenticate, updateOrderStatus);
router.patch("/:id/payment", authenticate, completePayment);
router.post("/:id/pay", authenticate, completePayment);

export default router;
