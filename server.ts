import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";

import connectToDB from "./src/config/db.js";
import errorMiddleware from "./src/middlewares/error.middleware.js";
import { versionMiddleware } from "./src/middlewares/version.middleware.js";
import transactionRouter from "./src/routes/transaction.routes.js";
import uploadRouter from "./src/routes/upload.routes.js";
import userRouter from "./src/routes/user.routes.js";

const app = express();

// Middleware
app.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    origin: ["http://localhost:3000", "https://ease-pay-chi.vercel.app", "https://easypay-dashboard.vercel.app"],
  }),
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", versionMiddleware);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/cloudinary", uploadRouter);

// Health check route
app.get("/health", (_req, res) => {
  res.status(200).json({
    message: "Server is running",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.send("Welcome to EasePay API");
});

// Error handling
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS policy blocked this request" });
    return;
  }
  next(err);
});

app.use(errorMiddleware);

// Initialize database connection
const initializeDB = async () => {
  try {
    await connectToDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

// Initialize DB (runs in both environments)
void initializeDB();

// Only start HTTP server when not in Vercel
if (!process.env.VERCEL) {
  const port = process.env.PORT ?? "5050";
  app.listen(Number(port), () => {
    console.log(`Server is running on port: ${port}`);
  });
}

// Export for Vercel serverless functions
export default app;