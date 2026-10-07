import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import prisma from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middlewares ---------------
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------- Routes ---------------
app.get("/", (req, res) => {
  res.status(200).json({ message: "Restaurant API is running" });
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
