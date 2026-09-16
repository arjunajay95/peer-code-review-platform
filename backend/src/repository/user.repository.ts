import prisma from "../config/prisma.js";
import type { PatchMeBody } from "../models/user.model.js";

export const publicUserSelect = {
  id: true,
  username: true,
  bio: true,
  githubUrl: true,
  karma: true,
  createdAt: true,
  technologies: { select: { id: true, name: true } },
  _count: { select: { reviews: true, submissions: true } },
} as const;

interface PaginationInput { page: number; limit: number; }

class UserRepository {
  findById(id: number) {
    return prisma.user.findUniqueOrThrow({ where: { id }, select: publicUserSelect });
  }

  findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username }, select: publicUserSelect });
  }

  update(id: number, data: PatchMeBody) {
    const { technologyIds, ...scalarFields } = data;
    return prisma.user.update({
      where: { id },
      data: {
        ...scalarFields,
        ...(technologyIds !== undefined && {
          technologies: { set: technologyIds.map((techId) => ({ id: techId })) },
        }),
      },
      select: publicUserSelect,
    });
  }

  async findSubmissions(userId: number, { page, limit }: PaginationInput) {
    const skip = (page - 1) * limit;
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where: { authorId: userId },
        select: {
          id: true, title: true, githubUrl: true, createdAt: true,
          technologies: { select: { id: true, name: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip, take: limit,
      }),
      prisma.submission.count({ where: { authorId: userId } }),
    ]);
    return { submissions, total };
  }

  async findReviews(userId: number, { page, limit }: PaginationInput) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { reviewerId: userId },
        select: {
          id: true, feedback: true, createdAt: true,
          submission: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip, take: limit,
      }),
      prisma.review.count({ where: { reviewerId: userId } }),
    ]);
    return { reviews, total };
  }

  async findReviewsReceived(userId: number, { page, limit }: PaginationInput) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { submission: { authorId: userId } },
        select: {
          id: true, feedback: true, createdAt: true,
          reviewer: { select: { id: true, username: true } },
          submission: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip, take: limit,
      }),
      prisma.review.count({ where: { submission: { authorId: userId } } }),
    ]);
    return { reviews, total };
  }
}

export default new UserRepository();
