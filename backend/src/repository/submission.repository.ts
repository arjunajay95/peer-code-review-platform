import prisma from "../config/prisma.js";

const submissionSelect = {
  id: true,
  title: true,
  description: true,
  githubUrl: true,
  authorId: true,
  createdAt: true,
  technologies: { select: { id: true, name: true } },
  criteria: { select: { id: true, label: true } },
} as const;

const submissionDetailSelect = {
  id: true,
  title: true,
  description: true,
  githubUrl: true,
  authorId: true,
  createdAt: true,
  author: { select: { id: true, username: true } },
  technologies: { select: { id: true, name: true } },
  criteria: { select: { id: true, label: true } },
  reviews: {
    select: {
      id: true,
      feedback: true,
      createdAt: true,
      reviewer: { select: { id: true, username: true } },
      ratings: { select: { criterionId: true, rating: true } },
    },
  },
  _count: { select: { reviews: true } },
} as const;

interface CreateWithCriteriaInput {
  authorId: number;
  title: string;
  description: string;
  githubUrl: string;
  technologies: string[];
  criteria: { label: string }[];
}

interface UpdateSubmissionInput {
  title: string;
  description: string;
  githubUrl: string;
  technologies: string[];
}

class SubmissionRepository {
  createWithCriteria(input: CreateWithCriteriaInput) {
    return prisma.submission.create({
      data: {
        title: input.title,
        description: input.description,
        githubUrl: input.githubUrl,
        author: { connect: { id: input.authorId } },
        technologies: {
          connectOrCreate: input.technologies.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        criteria: {
          create: input.criteria.map((criterion) => ({ label: criterion.label })),
        },
      },
      select: submissionSelect,
    });
  }

  findById(id: number) {
    return prisma.submission.findUnique({
      where: { id },
      select: submissionDetailSelect,
    });
  }

  findOwnership(id: number) {
    return prisma.submission.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });
  }

  update(id: number, input: UpdateSubmissionInput) {
    return prisma.submission.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        githubUrl: input.githubUrl,
        technologies: {
          set: [],
          connectOrCreate: input.technologies.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      select: submissionSelect,
    });
  }

  findForReview(id: number) {
    return prisma.submission.findUnique({
      where: { id },
      select: {
        authorId: true,
        criteria: { select: { id: true } },
      },
    });
  }

  findReviewedByUserRankedByReviewCount(userId: number, take: number) {
    return prisma.submission.findMany({
      where: { reviews: { some: { reviewerId: userId } } },
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: { select: { reviews: true } },
      },
      orderBy: [{ reviews: { _count: "desc" } }, { createdAt: "desc" }],
      take,
    });
  }
}

export default new SubmissionRepository();
