import logger from "./logger.js";

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = process.env;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    logger.error("❌ JWT secrets are not defined in environment variables");
    throw new Error("JWT secrets are not defined in environment variables");
}

export const jwtConfig = {
  accessExpiry: "15m",
  accessSecret: JWT_ACCESS_SECRET,   
  refreshExpiry: "7d",
  refreshSecret: JWT_REFRESH_SECRET,
};
