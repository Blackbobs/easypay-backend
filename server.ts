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

// Health check route (important for Vercel)
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

// Vercel-specific: Export the app for serverless functions
export default app;

// Local development: Only start server if not in Vercel environment
if (!process.env.VERCEL) {
  const port = process.env.PORT ? Number(process.env.PORT) : 5050;

  const startServer = async () => {
    try {
      await connectToDB();
      app.listen(port, () => {
        console.log(`Server is running on port: ${String(port)}`);
      });
    } catch (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
  };

  startServer().catch((err: unknown) => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });
} else {
  // For Vercel, just connect to DB when the function starts
  connectToDB()
    .then(() => {
      console.log("Database connected on Vercel");
    })
    .catch(console.error);
}
