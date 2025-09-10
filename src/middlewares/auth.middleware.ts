import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "#utils/token.js";
import jwt from "jsonwebtoken";
const { JsonWebTokenError, NotBeforeError, TokenExpiredError } = jwt;

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken as string | undefined;

  if (!accessToken) {
    return res.status(401).json({ message: "No access token provided" });
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    req.user = decoded;
     next();
  } catch (err: unknown) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Access token expired" });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid access token" });
    }
    if (err instanceof NotBeforeError) {
      return res.status(401).json({ message: "Access token not active yet" });
    }

    return res.status(401).json({ message: "Unauthorized" });
  }
};
