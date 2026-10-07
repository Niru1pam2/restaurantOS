import express from "express";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menu.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getMenuItems);
router.post("/", authenticate, authorize("OWNER", "MANAGER", "CHEF"), createMenuItem);
router.put("/:id", authenticate, authorize("OWNER", "MANAGER", "CHEF"), updateMenuItem);
router.delete("/:id", authenticate, authorize("OWNER", "MANAGER"), deleteMenuItem);

export default router;
