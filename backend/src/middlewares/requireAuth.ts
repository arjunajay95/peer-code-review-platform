import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { deriveUsername } from "../utils/deriveUsername.js";

export default catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "test" && req.headers["x-test-clerk-user-id"]) {
      const clerkId = req.headers["x-test-clerk-user-id"] as string;
      const user = await prisma.user.upsert({
        where: { clerkId },
        update: {},
        create: { clerkId, username: await deriveUsername(clerkId) },
        select: { id: true, username: true, karma: true },
      });
      req.user = user;
      return next();
    }
    const { userId } = getAuth(req);
    if (!userId) throw new UnauthorizedError("Authentication required");
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: { clerkId: userId, username: await deriveUsername(userId) },
      select: { id: true, username: true, karma: true },
    });
    req.user = user;
    next();
  },
);
