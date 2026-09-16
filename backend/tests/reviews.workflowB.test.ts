import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";
import { getAuthorToken, getReviewerToken } from "./helpers/auth.js";
import { createSubmission } from "./helpers/fixtures.js";

async function reviewPayload(submission: { criteria: { id: number }[] }, overrides: Record<string, unknown> = {}) {
  return {
    feedback: "Solid submission overall, clear structure and good test coverage.",
    strengths: "Clean code structure and well-named variables throughout.",
    improvements: "Could benefit from more inline comments and edge case handling.",
    ratings: submission.criteria.map((criterion) => ({ criterionId: criterion.id, rating: 4 })),
    ...overrides,
  };
}

describe("Workflow B: POST /api/submissions/:id/reviews", () => {
  it("201s, mints karma, and returns the reviewer's new total (INV-1)", async () => {
    const authorToken = await getAuthorToken();
    const reviewerToken = await getReviewerToken();
    const submission = await createSubmission(authorToken);
    const before = await request(app).get("/api/users/me").set("x-test-clerk-user-id", reviewerToken);
    const karmaBefore = before.body.data.karma;
    const res = await request(app)
      .post(`/api/submissions/${submission.id}/reviews`)
      .set("x-test-clerk-user-id", reviewerToken)
      .send(await reviewPayload(submission));
    expect(res.status).toBe(201);
    expect(res.body.data.reviewerKarma).toBe(karmaBefore + 2);
    const after = await request(app).get("/api/users/me").set("x-test-clerk-user-id", reviewerToken);
    expect(after.body.data.karma).toBe(karmaBefore + 2);
  });

  it("401s with no Authorization header", async () => {
    const authorToken = await getAuthorToken();
    const submission = await createSubmission(authorToken);
    const res = await request(app)
      .post(`/api/submissions/${submission.id}/reviews`)
      .send(await reviewPayload(submission));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("403s on a self-review (INV-2)", async () => {
    const authorToken = await getAuthorToken();
    const submission = await createSubmission(authorToken);
    const res = await request(app)
      .post(`/api/submissions/${submission.id}/reviews`)
      .set("x-test-clerk-user-id", authorToken)
      .send(await reviewPayload(submission));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("404s when the target submission does not exist", async () => {
    const reviewerToken = await getReviewerToken();
    const res = await request(app)
      .post("/api/submissions/999999999/reviews")
      .set("x-test-clerk-user-id", reviewerToken)
      .send({
        feedback: "Does not matter, target does not exist.",
        strengths: "Nothing to say here.",
        improvements: "Nothing to improve here.",
        ratings: [{ criterionId: 1, rating: 5 }],
      });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("400s CRITERIA_MISMATCH when a rated criterion belongs to a different submission", async () => {
    const authorToken = await getAuthorToken();
    const reviewerToken = await getReviewerToken();
    const submissionA = await createSubmission(authorToken, { title: "Submission A" });
    const submissionB = await createSubmission(authorToken, { title: "Submission B" });
    const res = await request(app)
      .post(`/api/submissions/${submissionB.id}/reviews`)
      .set("x-test-clerk-user-id", reviewerToken)
      .send({
        feedback: "Rating submission B using a criterion id that belongs to submission A.",
        strengths: "Some strengths here.",
        improvements: "Some improvements here.",
        ratings: [{ criterionId: submissionA.criteria[0].id, rating: 3 }],
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("CRITERIA_MISMATCH");
  });

  it("409s on a duplicate review of the same submission (INV-2)", async () => {
    const authorToken = await getAuthorToken();
    const reviewerToken = await getReviewerToken();
    const submission = await createSubmission(authorToken);
    const first = await request(app)
      .post(`/api/submissions/${submission.id}/reviews`)
      .set("x-test-clerk-user-id", reviewerToken)
      .send(await reviewPayload(submission));
    expect(first.status).toBe(201);
    const second = await request(app)
      .post(`/api/submissions/${submission.id}/reviews`)
      .set("x-test-clerk-user-id", reviewerToken)
      .send(await reviewPayload(submission, { feedback: "Trying to review the same submission a second time." }));
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("CONFLICT");
  });

  it("flips the submission's derived status to REVIEWED", async () => {
    const authorToken = await getAuthorToken();
    const reviewerToken = await getReviewerToken();
    const submission = await createSubmission(authorToken);
    await request(app)
      .post(`/api/submissions/${submission.id}/reviews`)
      .set("x-test-clerk-user-id", reviewerToken)
      .send(await reviewPayload(submission));
    const detail = await request(app).get(`/api/submissions/${submission.id}`);
    expect(detail.body.data.status).toBe("REVIEWED");
  });
});

describe("no update or delete surface for reviews (INV-3, INV-4)", () => {
  it("PATCH, PUT, and DELETE on a review route all hit the 404 envelope", async () => {
    const authorToken = await getAuthorToken();
    const reviewerToken = await getReviewerToken();
    const submission = await createSubmission(authorToken);
    const created = await request(app)
      .post(`/api/submissions/${submission.id}/reviews`)
      .set("x-test-clerk-user-id", reviewerToken)
      .send(await reviewPayload(submission));
    const reviewId = created.body.data.id;
    for (const method of ["patch", "put", "delete"] as const) {
      const res = await request(app)[method](`/api/submissions/${submission.id}/reviews/${reviewId}`)
        .set("x-test-clerk-user-id", reviewerToken);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    }
  });
});

describe("karma rollback (D-13, the atomic transaction)", () => {
  it("leaves karma unchanged when the transaction fails mid-write", async () => {
    const authorToken = await getAuthorToken();
    const reviewerToken = await getReviewerToken();
    const submission = await createSubmission(authorToken);
    const reviewerBefore = await request(app).get("/api/users/me").set("x-test-clerk-user-id", reviewerToken);
    const reviewerId = reviewerBefore.body.data.id;
    const karmaBefore = reviewerBefore.body.data.karma;
    const reviewRepository = (await import("../src/repository/review.repository.js")).default;
    await expect(
      reviewRepository.createWithKarma({
        reviewerId,
        submissionId: submission.id,
        feedback: "This write should fail and roll back entirely.",
        strengths: "Nothing relevant here.",
        improvements: "Nothing relevant here.",
        ratings: [{ criterionId: 999999999, rating: 5 }],
      }),
    ).rejects.toThrow();
    const reviewerAfter = await request(app).get("/api/users/me").set("x-test-clerk-user-id", reviewerToken);
    expect(reviewerAfter.body.data.karma).toBe(karmaBefore);
    const reviewCount = await prisma.review.count({ where: { reviewerId, submissionId: submission.id } });
    expect(reviewCount).toBe(0);
  });
});
