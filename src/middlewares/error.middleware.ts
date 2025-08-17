import type { Request, Response } from "express";

import logger from "#config/logger.js";
import  ApiError from "#utils/api-error.js";



const errorMiddleware = (
  err: ApiError | Error,
  req: Request,
  res: Response,
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Log the error
  logger.error({
    message: err.message,
    method: req.method,
    path: req.originalUrl,
    stack: err.stack,
    statusCode,
  });

  res.status(statusCode).json({
      message,
    success: false,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
export default errorMiddleware
