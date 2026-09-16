import reviewRepository from "../repository/review.repository.js";
import submissionRepository from "../repository/submission.repository.js";
import type { CreateReviewBody } from "../models/review.model.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { Prisma } from "../generated/prisma/client.js";

class ReviewService {
  async create(reviewerId: number, submissionId: number, input: CreateReviewBody) {
    const submission = await submissionRepository.findForReview(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    if (submission.authorId === reviewerId) {
      throw new ForbiddenError("You cannot review your own submission");
    }

    const validCriterionIds = new Set(submission.criteria.map((criterion) => criterion.id));
    const hasMismatchedCriterion = input.ratings.some((rating) => !validCriterionIds.has(rating.criterionId));

    if (hasMismatchedCriterion) {
      throw new BadRequestError("Rated criterion does not belong to this submission", "CRITERIA_MISMATCH");
    }

    try {
      return await reviewRepository.createWithKarma({
        reviewerId,
        submissionId,
        feedback: input.feedback,
        strengths: input.strengths,
        improvements: input.improvements,
        resources: input.resources,
        ratings: input.ratings,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("You have already reviewed this submission");
      }
      throw error;
    }
  }
}

export default new ReviewService();
