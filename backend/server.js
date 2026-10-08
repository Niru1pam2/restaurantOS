import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "./config/db.js";

import {
  authRoutes,
  tableRoutes,
  categoryRoutes,
  menuRoutes,
  ingredientRoutes,
  recipeRoutes,
  supplierRoutes,
  staffRoutes,
  orderRoutes,
  inventoryRoutes,
  expenseRoutes,
  dashboardRoutes,
  aiRoutes,
  invoiceRoutes,
} from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middlewares ---------------
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder for uploaded invoice files & assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------- Routes ---------------
app.get("/", (req, res) => {
  res.status(200).json({ message: "RestaurantOS API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/invoices", invoiceRoutes);

// --------------- Global Error Handler ---------------
app.use((err, req, res, next) => {
  console.error("Global Error Handler caught:", err);
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// --------------- Start Server ---------------
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});


