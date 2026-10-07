import express from "express";
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, authorize("OWNER", "MANAGER"), getStaff);
router.post("/", authenticate, authorize("OWNER", "MANAGER"), createStaff);
router.put("/:id", authenticate, authorize("OWNER"), updateStaff);
router.delete("/:id", authenticate, authorize("OWNER"), deleteStaff);

export default router;
