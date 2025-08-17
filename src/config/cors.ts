import type { CorsOptions } from "cors";

const allowedOrigins = ["http://localhost:3000"];

const corsOptions: CorsOptions = {
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

export default corsOptions;
