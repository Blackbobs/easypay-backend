import type { NextFunction, Request, Response } from "express";

import logger from "#config/logger.js";

const allowedVersions = ["v1", "v2"];

export const versionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const parts = req.originalUrl.split("/");
  const version = parts[2];

  if (!version || !allowedVersions.includes(version)) {
    logger.warn(`Unsupported API version: ${version ?? "none"}`);
    res.status(400).json({
      message: `Unsupported API version: ${version ?? "none"}`,
      status: "Failed",
    });
    return;
  }

  next();
};
