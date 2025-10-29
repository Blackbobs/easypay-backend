import type { Request, Response } from "express";

import logger from "#config/logger.js";
import RefreshToken from "#models/refresh-token.model.js";
import User from "#models/user.model.js";
import { generateAccessToken, verifyRefreshToken } from "#utils/token.js";
import jwt from "jsonwebtoken";

const { JsonWebTokenError, NotBeforeError, TokenExpiredError } = jwt;

export const refreshTokenController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    // Ensure token exists in DB
    const storedToken = await RefreshToken.findOne({
      revoked: false,
      token: refreshToken,
      user: decoded.id,
    });

    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id);
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
      maxAge: 15 * 60 * 1000,
      sameSite: "none",
      secure: true,
    });

    return res.json({ accessToken: newAccessToken });
  } catch (err: unknown) {
    if (err instanceof TokenExpiredError) {
      logger.warn("Refresh token expired");
      return res.status(401).json({ message: "Refresh token expired" });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    if (err instanceof NotBeforeError) {
      return res.status(401).json({ message: "Refresh token not active yet" });
    }

    logger.error("Unexpected refresh error", { error: String(err) });
    return res.status(401).json({ message: "Refresh failed" });
  }
};
