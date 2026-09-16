// Types mirroring the backend repository `select` shapes (D-08).
// These are the contract: submissionSelect / submissionDetailSelect in
// backend/src/repository/submission.repository.ts, reviewSelect in
// backend/src/repository/review.repository.ts.

export interface Technology {
  id: number;
  name: string;
}

export interface Criterion {
  id: number;
  label: string;
}

export interface CriterionRating {
  criterionId: number;
  rating: number;
}

export interface ReviewAuthor {
  id: number;
  username: string;
}

// A review as it appears embedded in a submission detail response.
export interface EmbeddedReview {
  id: number;
  feedback: string;
  strengths: string;
  improvements: string;
  resources?: string;
  createdAt: string;
  reviewer: ReviewAuthor;
  ratings: CriterionRating[];
}

// GET /api/submissions/:id (submissionDetailSelect + derived status, D-14)
export interface SubmissionDetail {
  id: number;
  title: string;
  description: string;
  githubUrl: string;
  authorId: number;
  createdAt: string;
  author: ReviewAuthor;
  technologies: Technology[];
  criteria: Criterion[];
  reviews: EmbeddedReview[];
  status: "PENDING" | "REVIEWED";
}

// POST /api/submissions and PUT /api/submissions/:id (submissionSelect)
export interface Submission {
  id: number;
  title: string;
  description: string;
  githubUrl: string;
  authorId: number;
  createdAt: string;
  technologies: Technology[];
  criteria: Criterion[];
}

// POST /api/submissions/:id/reviews response (reviewSelect + reviewerKarma)
export interface ReviewResult {
  id: number;
  feedback: string;
  strengths: string;
  improvements: string;
  resources?: string;
  createdAt: string;
  submissionId: number;
  reviewerId: number;
  ratings: CriterionRating[];
  reviewerKarma: number;
}
