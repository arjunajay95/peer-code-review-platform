import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { BadRequestError } from "../errors/BadRequestError.js";

export const validate = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    next(new BadRequestError(result.error.issues.map((issue) => issue.message).join(", ")));
    return;
  }

  const parsed = result.data as { body?: unknown; query?: unknown; params?: unknown };
  req.body = parsed.body;

  // Express 5: req.query is a read-only getter derived from the URL.
  // Use Object.defineProperty to set the coerced/validated query values.
  if (parsed.query !== undefined) {
    Object.defineProperty(req, "query", {
      value: parsed.query,
      configurable: true,
      writable: true,
      enumerable: true,
    });
  }

  req.params = parsed.params as Request["params"];

  next();
};
