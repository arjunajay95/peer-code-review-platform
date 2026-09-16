import prisma from "../config/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

// Exact field list required by SCHEMA §7
const feedWindowSelect = {
  id: true,
  title: true,
  description: true,
  githubUrl: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      username: true,
    }
  },
  technologies: {
    select: {
      id: true,
      name: true,
    }
  },
  _count: {
    select: {
      reviews: true,
    }
  }
} satisfies Prisma.SubmissionSelect;

// Derived type based on our select
export type FeedSubmission = Prisma.SubmissionGetPayload<{ select: typeof feedWindowSelect }>;

class FeedRepository {
  /**
   * Fetches the public feed window based on offset pagination and optional filters.
   */
  async getPublicFeed(
    skip: number,
    take: number,
    search?: string,
    technologies?: string[]
  ): Promise<[FeedSubmission[], number]> {
    
    const where: Prisma.SubmissionWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (technologies && technologies.length > 0) {
      where.technologies = {
        some: {
          name: {
            in: technologies,
          }
        }
      };
    }

    // Two sequential queries instead of one transaction for offset pagination counts, per D-16
    const count = await prisma.submission.count({ where });
    const items = await prisma.submission.findMany({
      where,
      select: feedWindowSelect,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
      skip,
      take,
    });

    return [items, count];
  }

  /**
   * Fetches the user's technology IDs.
   */
  async getUserTechnologies(userId: number): Promise<number[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        technologies: {
          select: { id: true }
        }
      }
    });
    return user?.technologies.map(t => t.id) ?? [];
  }

  /**
   * Fetches the 200-item bounded window for the personalized feed.
   */
  async getPersonalizedFeedWindow(windowSize: number): Promise<FeedSubmission[]> {
    return prisma.submission.findMany({
      select: feedWindowSelect,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
      take: windowSize,
    });
  }
}

export const feedRepository = new FeedRepository();
