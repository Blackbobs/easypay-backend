import type { NextFunction, Request, Response } from "express";

import logger from "#config/logger.js";
import RefreshToken from "#models/refresh-token.model.js";
import User from "#models/user.model.js";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "#utils/token.js";
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  const refreshToken = req.cookies.refreshToken as string | undefined;

  if (!accessToken) {
    return res.status(401).json({ message: "No access token provided" });
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    req.user = decoded;
     next();
  } catch (err: unknown) {
    // Access token expired? Try refresh
    if (err instanceof TokenExpiredError && refreshToken) {
      try {
        const decodedRefresh = verifyRefreshToken(refreshToken);

        // Find refresh token in DB
        const storedToken = await RefreshToken.findOne({
          revoked: false,
          token: refreshToken,
          user: decodedRefresh.id,
        });

        if (!storedToken) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        const user = await User.findById(decodedRefresh.id);
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({
          id: user._id,
          role: user.role,
        });

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          maxAge: 15 * 60 * 1000, // 15 minutes
          sameSite: "none",
          secure: process.env.NODE_ENV === "production",
        });

        req.user = verifyAccessToken(newAccessToken);
         next();
      } catch (refreshErr: unknown) {
        if (refreshErr instanceof TokenExpiredError) {
          logger.warn("Refresh token expired");
          return res.status(401).json({ message: "Refresh token expired" });
        }
        if (refreshErr instanceof JsonWebTokenError) {
          logger.warn("Invalid refresh token");
          return res.status(401).json({ message: "Invalid refresh token" });
        }
        if (refreshErr instanceof NotBeforeError) {
          logger.warn("Refresh token not active yet");
          return res.status(401).json({ message: "Refresh token not active yet" });
        }

        logger.error("Unexpected error during refresh", {
          error: String(refreshErr),
        });
        return res.status(401).json({ message: "Refresh failed" });
      }
    }

    
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid access token" });
    }
    if (err instanceof NotBeforeError) {
      return res.status(401).json({ message: "Access token not active yet" });
    }

    logger.error("Unexpected JWT verification error", { error: String(err) });
    return res.status(401).json({ message: "Unauthorized" });
  }
};
