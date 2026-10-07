import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import tableRoutes from "./routes/tables.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import ingredientRoutes from "./routes/ingredients.routes.js";
import recipeRoutes from "./routes/recipes.routes.js";
import supplierRoutes from "./routes/suppliers.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import expenseRoutes from "./routes/expenses.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import invoiceRoutes from "./routes/invoices.routes.js";

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

