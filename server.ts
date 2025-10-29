// // import corsOptions from "#config/cors.js";
// import connectToDB from "#config/db.js";
// import errorMiddleware from "#middlewares/error.middleware.js";
// import { versionMiddleware } from "#middlewares/version.middleware.js";
// import transactionRouter from "#routes/transaction.routes.js";
// import uploadRouter from "#routes/upload.routes.js";
// import userRouter from "#routes/user.routes.js";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import express, { type NextFunction, type Request, type Response } from "express";
// import helmet from "helmet";

// if (process.env.NODE_ENV === "production") {
//   void import("./utils/self-ping.js");
// }

// const app = express();
// const port = process.env.PORT ? Number(process.env.PORT) : 5050;

// app.use(
//   cors({
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     origin: ["http://localhost:3000", "https://ease-pay-chi.vercel.app", "https://easypay-dashboard.vercel.app"],
//   }),
// );

// // app.use(cors(corsOptions));
// app.use(helmet());
// app.use(express.json());
// app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));

// app.use("/api", versionMiddleware);

// app.use("/api/v1/users", userRouter);
// app.use("/api/v1/transactions", transactionRouter);
// app.use("/api/v1/cloudinary", uploadRouter);

// app.use("/", (req, res) => {
//   res.send("Welcome to easepay");
// });

// app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
//   if (err instanceof Error && err.message === "Not allowed by CORS") {
//     res.status(403).json({ error: "CORS policy blocked this request" });
//     return;
//   }

//   next(err);
// });

// app.use(errorMiddleware);

// const startServer = async () => {
//   try {
//     await connectToDB();
//     app.listen(port, () => {
//       console.log(`Server is running on port: ${String(port)}`);
//     });
//   } catch (err) {
//     console.error("Failed to start server:", err);
//     process.exit(1);
//   }
// };

// startServer().catch((err: unknown) => {
//   if (err instanceof Error) {
//     console.error("Unexpected error in startServer:", err.message);
//   } else {
//     console.error("Unexpected unknown error:", err);
//   }
//   process.exit(1);
// });

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



if (process.env.NODE_ENV === "production") {
  void import("./src/utils/self-ping.js");
}

const app = express();

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

app.use("/api", versionMiddleware);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/cloudinary", uploadRouter);

app.use("/", (_req, res) => {
  res.send("Welcome to EasePay");
});

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS policy blocked this request" });
    return;
  }
  next(err);
});

app.use(errorMiddleware);

connectToDB()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err: unknown) => {
    console.error("DB connection error:", err);
  });

export default app;
