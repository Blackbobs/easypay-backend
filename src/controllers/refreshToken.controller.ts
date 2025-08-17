import type { Request, Response } from "express";

import logger from "#config/logger.js";
import RefreshToken from "#models/refresh-token.model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "#utils/token.js";

interface RefreshTokenRequest {
  refreshToken: string;
}

export const refreshToken = async (req: Request<object, object, RefreshTokenRequest>, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("⚠️ Refresh attempt without token");
      res.status(401).json({ message: "Refresh token required" });
      return;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      logger.warn("❌ Invalid refresh token", err);
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      logger.warn("⚠️ Refresh token not found in DB or revoked", { tokenId: decoded.id });
      return res.status(403).json({ message: "Refresh token invalid or revoked" });
    }

    const newAccessToken = generateAccessToken({
      email: decoded.email,
      id: decoded.id,
      role: decoded.role,
    });

    const newRefreshToken = generateRefreshToken({
      email: decoded.email,
      id: decoded.id,
      role: decoded.role,
    });

    storedToken.token = newRefreshToken;
    await storedToken.save();

    logger.info("✅ Access token refreshed successfully", { userId: decoded.id });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Unable to refresh access token", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unable to refresh access token", { error: String(error) });
    }

    res.status(500).json({
      message: "Unable to refresh access token",
      status: "Failed",
    });
  }
};
