import express from "express";
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
} from "../controllers/tables.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getTables);
router.post("/", authenticate, authorize("OWNER", "MANAGER"), createTable);
router.put("/:id", authenticate, updateTable);
router.patch("/:id", authenticate, updateTable);
router.patch("/:id/status", authenticate, updateTable);
router.delete("/:id", authenticate, authorize("OWNER", "MANAGER"), deleteTable);

export default router;
