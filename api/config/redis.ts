import Redis from "ioredis";

import logger from "./logger.js";


const redis = new Redis({
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  password: process.env.REDIS_PASSWORD ?? undefined,
  port: Number(process.env.REDIS_PORT) || 6379,
});

redis.on("connect", () => {
  logger.info("✅ Redis connected");
  console.log("✅ Redis connected");
});

redis.on("error", (err: Error) => {
  logger.error("❌ Redis error:", { message: err.message, stack: err.stack });
  console.error("❌ Redis error:", err);
});

export default redis;
