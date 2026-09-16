import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import logger from "../config/logger.js";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    if (!error.isOperationalError) {
      logger.error(error.stack ?? error.message);
    }
    res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message },
    });
    return;
  }

  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  logger.error(message);

  res.status(500).json({
    success: false,
    error: { code: "INTERNAL", message: "Something went wrong." },
  });
};
