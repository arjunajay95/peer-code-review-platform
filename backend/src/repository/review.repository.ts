import prisma from "../config/prisma.js";
import { KARMA_PER_REVIEW } from "../config/constants.js";

const reviewSelect = {
  id: true,
  feedback: true,
  strengths: true,
  improvements: true,
  resources: true,
  createdAt: true,
  submissionId: true,
  reviewerId: true,
  ratings: { select: { criterionId: true, rating: true } },
} as const;

interface CreateWithKarmaInput {
  reviewerId: number;
  submissionId: number;
  feedback: string;
  strengths: string;
  improvements: string;
  resources?: string;
  ratings: { criterionId: number; rating: number }[];
}

class ReviewRepository {
  createWithKarma(input: CreateWithKarmaInput) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          feedback: input.feedback,
          strengths: input.strengths,
          improvements: input.improvements,
          resources: input.resources ?? null,
          reviewer: { connect: { id: input.reviewerId } },
          submission: { connect: { id: input.submissionId } },
          ratings: {
            create: input.ratings.map((rating) => ({
              criterionId: rating.criterionId,
              rating: rating.rating,
            })),
          },
        },
        select: reviewSelect,
      });

      const reviewer = await tx.user.update({
        where: { id: input.reviewerId },
        data: { karma: { increment: KARMA_PER_REVIEW } },
        select: { karma: true },
      });

      return { ...review, reviewerKarma: reviewer.karma };
    });
  }
}

export default new ReviewRepository();
