import { describe, expect, it } from "vitest";
import prisma from "../src/config/prisma.js";

// SCHEMA sec5. Runs last (file name sorts after the others) so it audits
// the database state left behind by every workflow test that ran before it.
// Every query must return zero rows on a healthy database.
describe("SCHEMA verification queries (V-Q1 to V-Q4)", () => {
  it("V-Q1: karma always equals 2 times the user's review count (D-13)", async () => {
    const rows = await prisma.$queryRaw`
      SELECT u.id, u.username, u.karma, 2 * COUNT(r.id) AS expected
      FROM "User" u
      LEFT JOIN "Review" r ON r."reviewerId" = u.id
      GROUP BY u.id
      HAVING u.karma <> 2 * COUNT(r.id);
    `;

    expect(rows).toEqual([]);
  });

  it("V-Q2: no review is a self-review (INV-2)", async () => {
    const rows = await prisma.$queryRaw`
      SELECT r.id
      FROM "Review" r
      JOIN "Submission" s ON s.id = r."submissionId"
      WHERE s."authorId" = r."reviewerId";
    `;

    expect(rows).toEqual([]);
  });

  it("V-Q3: every review rates every criterion of its submission, exactly once", async () => {
    const rows = await prisma.$queryRaw`
      SELECT r.id AS review_id
      FROM "Review" r
      JOIN "Submission" s ON s.id = r."submissionId"
      LEFT JOIN "Criterion" c ON c."submissionId" = s.id
      LEFT JOIN "CriterionRating" cr
        ON cr."reviewId" = r.id AND cr."criterionId" = c.id
      GROUP BY r.id
      HAVING COUNT(c.id) <> COUNT(cr.id);
    `;

    expect(rows).toEqual([]);
  });

  it("V-Q4: no rating references a criterion outside its own submission", async () => {
    const rows = await prisma.$queryRaw`
      SELECT cr.id
      FROM "CriterionRating" cr
      JOIN "Review" r ON r.id = cr."reviewId"
      JOIN "Criterion" c ON c.id = cr."criterionId"
      WHERE c."submissionId" <> r."submissionId";
    `;

    expect(rows).toEqual([]);
  });
});
