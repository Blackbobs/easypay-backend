import corsOptions from "#config/cors.js";
import connectToDB from "#config/db.js";
import errorMiddleware from "#middlewares/error.middleware.js";
import { versionMiddleware } from "#middlewares/version.middleware.js";
import transactionRouter from "#routes/transaction.routes.js";
import uploadRouter from "#routes/upload.routes.js";
import userRouter from "#routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";

if (process.env.NODE_ENV === "production") {
  void import("./utils/self-ping.js");
}

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 5050;

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(cookieParser())

app.use("/api", versionMiddleware);

app.use("/api/v1/users", userRouter)
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/cloudinary", uploadRouter);

app.use("/", (req, res) => {
  res.send("Welcome to easepay");
});

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS policy blocked this request" });
    return;
  }

  next(err);
});

app.use(errorMiddleware);

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
  if (err instanceof Error) {
    console.error("Unexpected error in startServer:", err.message);
  } else {
    console.error("Unexpected unknown error:", err);
  }
  process.exit(1);
});
