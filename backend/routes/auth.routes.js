import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  getOwnerOnly,
  getKitchen,
} from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

// Role-restricted routes
router.get("/owner-only", authenticate, authorize("OWNER"), getOwnerOnly);
router.get(
  "/kitchen",
  authenticate,
  authorize("OWNER", "MANAGER", "CHEF"),
  getKitchen
);

export default router;
