import { Router } from "express";
import { z } from "zod";
import requireAuth from "../middlewares/requireAuth.js";
import { validate } from "../middlewares/validate.middleware.js";
import { patchMeBodySchema } from "../models/user.model.js";
import userController from "../controller/user.controller.js";
import { catchAsync } from "../utils/catchAsync.js";
import prisma from "../config/prisma.js";
import { publicUserSelect } from "../repository/user.repository.js";

const router = Router();

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

router.get(
  "/me",
  requireAuth,
  catchAsync(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
      select: publicUserSelect,
    });
    res.json({ success: true, data: user });
  }),
);

router.patch(
  "/me",
  requireAuth,
  validate(z.object({ body: patchMeBodySchema })),
  catchAsync(async (req, res) => {
    const { technologyIds, ...scalarFields } = req.body as {
      technologyIds?: number[];
      username?: string;
      bio?: string | null;
      githubUrl?: string | null;
    };
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...scalarFields,
        ...(technologyIds !== undefined && {
          technologies: { set: technologyIds.map((id) => ({ id })) },
        }),
      },
      select: publicUserSelect,
    });
    res.json({ success: true, data: user });
  }),
);

router.get(
  "/me/submissions",
  requireAuth,
  validate(z.object({ query: paginationQuerySchema })),
  catchAsync(async (req, res) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const skip = (page - 1) * limit;
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where: { authorId: req.user!.id },
        select: {
          id: true,
          title: true,
          githubUrl: true,
          createdAt: true,
          technologies: { select: { id: true, name: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip,
        take: limit,
      }),
      prisma.submission.count({ where: { authorId: req.user!.id } }),
    ]);
    res.json({
      success: true,
      data: submissions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),
);

router.get(
  "/me/reviews",
  requireAuth,
  validate(z.object({ query: paginationQuerySchema })),
  catchAsync(async (req, res) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { reviewerId: req.user!.id },
        select: {
          id: true,
          feedback: true,
          createdAt: true,
          submission: {
            select: {
              id: true,
              title: true,
              description: true,
              technologies: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { reviewerId: req.user!.id } }),
    ]);
    res.json({
      success: true,
      data: reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),
);

router.get(
  "/me/reviews-received",
  requireAuth,
  validate(z.object({ query: paginationQuerySchema })),
  catchAsync(async (req, res) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { submission: { authorId: req.user!.id } },
        select: {
          id: true,
          feedback: true,
          createdAt: true,
          reviewer: { select: { id: true, username: true } },
          submission: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { submission: { authorId: req.user!.id } } }),
    ]);
    res.json({
      success: true,
      data: reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),
);

// Public, no auth. Must be last.
router.get("/:username", userController.getByUsername);

export default router;
