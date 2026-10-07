import express from "express";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/suppliers.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getSuppliers);
router.post("/", authenticate, authorize("OWNER", "MANAGER"), createSupplier);
router.put("/:id", authenticate, authorize("OWNER", "MANAGER"), updateSupplier);
router.delete("/:id", authenticate, authorize("OWNER", "MANAGER"), deleteSupplier);

export default router;
