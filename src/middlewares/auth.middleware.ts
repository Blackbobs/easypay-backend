import type { NextFunction, Request, Response } from "express";

import logger from "#config/logger.js";
import { verifyAccessToken } from "#utils/token.js";
import jwt from "jsonwebtoken";


const { JsonWebTokenError, NotBeforeError, TokenExpiredError } = jwt;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      logger.warn("Unauthorized access attempt - no token provided");
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const tokenParts = authHeader.split(" ");
    const token = tokenParts[1];

    if (!token) {
      logger.warn("Malformed authorization header - missing token");
      res.status(401).json({ message: "Malformed token" });
      return;
    }

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        logger.warn("Access token expired");
        res.status(401).json({ message: "Token expired" });
        return;
      }

      if (err instanceof JsonWebTokenError) {
        logger.error("Invalid JWT", { error: err.message });
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      if (err instanceof NotBeforeError) {
        logger.error("JWT not active", { error: err.message });
        res.status(401).json({ message: "Token not active yet" });
        return;
      }

      logger.error("Unexpected JWT verification error", { error: String(err) });
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  } catch (err) {
    logger.error("Unexpected auth middleware error", { error: String(err) });
    res.status(500).json({ message: "Server error" });
    return;
  }
};
