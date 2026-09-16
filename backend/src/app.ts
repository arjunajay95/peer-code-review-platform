import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { morganMiddleware } from "./middlewares/morgan.middleware.js";
import { globalLimiter } from "./middlewares/rateLimiter.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { catchAsync } from "./utils/catchAsync.js";
import technologiesRouter from "./routes/technologies.router.js";
import usersRouter from "./routes/users.router.js";
import submissionRouter from "./routes/submission.routes.js";
import feedRouter from "./routes/feed.routes.js";

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(morganMiddleware);
app.use("/api", globalLimiter);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/technologies", technologiesRouter);
app.use("/api/users", usersRouter);

app.use("/api/submissions", submissionRouter);
app.use("/api/feed", feedRouter);

app.get(
  "/api/health",
  catchAsync(async (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  }),
);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found." },
  });
});

app.use(errorHandler);

export default app;
