import express from "express";
import next from "next";
import { PrismaClient } from "@prisma/client"; // ✅ prisma client
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import multer from "multer";

// Routes
import userRoute from "./routes/userRoute/userRoutes.js";
import productRoute from "./routes/productRoute/productRoutes.js";
import categoryRoute from "./routes/categoryRoute/categoryRoute.js";
import cartRoute from "./routes/cartRoute/cartRoute.js";
import orderRoute from "./routes/orderRoute/orderRoute.js";
import statusRouter from "./routes/statusRoute/statusRoutes.js";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== "production";
const prisma = new PrismaClient();

// Next.js app setup
const nextApp = next({
  dev,
  dir: path.join(__dirname, "..") // root folder me Next.js
});

const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const upload = multer();

  // Static files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // API routes
  app.use("/api", userRoute);
  app.use("/api", productRoute);
  app.use("/api", categoryRoute);
  app.use("/api", cartRoute);
  app.use("/api", orderRoute);
  app.use("/api", statusRouter);

  // Next.js pages
app.use((req, res) => {
  return handle(req, res);
});


  // Error handling
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  // Use process.env.PORT for Railway, fallback 3000
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
});
