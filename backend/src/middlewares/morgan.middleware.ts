import morgan from "morgan";
import type { Request, Response } from "express";
import logger from "../config/logger.js";

const stream = {
  write: (message: string) => logger.http(message.trim()),
};

export const morganMiddleware = morgan<Request, Response>(
  ":remote-addr :method :url :status :res[content-length] - :response-time ms",
  {
    stream,
    skip: (req) => req.originalUrl === "/api/health",
  },
);
