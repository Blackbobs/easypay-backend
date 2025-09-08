import Redis from "ioredis"

import logger from "./logger"


const redis = new Redis({
    host: process.env.REDIS_HOST ?? "127.0.0.1",
    password: process.env.REDIS_PASSWORD ?? undefined,
    port: Number(process.env.REDIS_PORT) || 6379,
})

redis.on("connect", () => {
    logger.warn("✅ Redis connected")
    console.log("✅ Redis connected")
})

redis.on("error", () => {
    logger.error("❌ Redis error: ", {err})
    console.log("❌ Redis error")
})

export default redis