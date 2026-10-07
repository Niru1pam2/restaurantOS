import express from "express";
import multer from "multer";
import path from "path";
import {
  processInvoice,
  getInvoices,
  exportExpenseRegisterExcel,
} from "../controllers/invoices.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", authenticate, getInvoices);
router.post("/process", authenticate, authorize("OWNER", "MANAGER"), upload.single("file"), processInvoice);
router.get("/export-excel", authenticate, exportExpenseRegisterExcel);

export default router;
