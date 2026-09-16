import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { getAuthorToken, getReviewerToken } from "./helpers/auth.js";
import { createSubmission } from "./helpers/fixtures.js";

describe("Workflow A: POST /api/submissions", () => {
  it("201s and returns the shaped submission for a valid request", async () => {
    const token = await getAuthorToken();

    const res = await request(app)
      .post("/api/submissions")
      .set("x-test-clerk-user-id", token)
      .send({
        title: "React Dashboard",
        description: "A dashboard built with React for tracking analytics.",
        githubUrl: "https://github.com/someuser/react-dashboard",
        technologies: ["React", " react ", "typescript"],
        criteria: [{ label: "Code quality" }, { label: "Documentation" }],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("React Dashboard");
    expect(res.body.data.criteria).toHaveLength(2);
    // technologies get normalized and deduped: "React", " react ", "react" all collapse to one (D-17).
    expect(res.body.data.technologies.map((t: { name: string }) => t.name).sort()).toEqual(["react", "typescript"]);
  });

  it("401s with no Authorization header", async () => {
    const res = await request(app).post("/api/submissions").send({
      title: "No auth",
      description: "This should be rejected before validation even runs.",
      githubUrl: "https://github.com/someuser/no-auth",
      technologies: ["react"],
      criteria: [{ label: "Code quality" }],
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("400s on a missing required field", async () => {
    const token = await getAuthorToken();

    const res = await request(app)
      .post("/api/submissions")
      .set("x-test-clerk-user-id", token)
      .send({
        description: "Missing the title field entirely.",
        githubUrl: "https://github.com/someuser/missing-title",
        technologies: ["react"],
        criteria: [{ label: "Code quality" }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("400s when an identity field is smuggled into the body", async () => {
    const token = await getAuthorToken();

    const res = await request(app)
      .post("/api/submissions")
      .set("x-test-clerk-user-id", token)
      .send({
        title: "Trying to spoof identity",
        description: "This request illegally includes an authorId field.",
        githubUrl: "https://github.com/someuser/spoof",
        technologies: ["react"],
        criteria: [{ label: "Code quality" }],
        authorId: 999999,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/submissions/:id", () => {
  it("200s with criteria, reviews, and derived PENDING status for a fresh submission", async () => {
    const authorToken = await getAuthorToken();
    const submission = await createSubmission(authorToken);

    const res = await request(app).get(`/api/submissions/${submission.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("PENDING");
    expect(res.body.data.reviews).toEqual([]);
    expect(res.body.data.criteria).toHaveLength(2);
  });

  it("404s for a submission id that does not exist", async () => {
    const res = await request(app).get("/api/submissions/999999999");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("never serializes clerkId anywhere in the response", async () => {
    const authorToken = await getAuthorToken();
    const submission = await createSubmission(authorToken);

    const res = await request(app).get(`/api/submissions/${submission.id}`);

    expect(JSON.stringify(res.body)).not.toContain("clerkId");
  });
});

describe("Workflow A2: PUT /api/submissions/:id", () => {
  it("200s and applies the edit for the owner", async () => {
    const authorToken = await getAuthorToken();
    const submission = await createSubmission(authorToken);

    const res = await request(app)
      .put(`/api/submissions/${submission.id}`)
      .set("x-test-clerk-user-id", authorToken)
      .send({
        title: "Updated title",
        description: "Updated description after initial feedback from reviewers.",
        githubUrl: "https://github.com/someuser/test-repo",
        technologies: ["vue"],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated title");
    expect(res.body.data.technologies.map((t: { name: string }) => t.name)).toEqual(["vue"]);
    // Criteria must be untouched by an edit (D-03).
    expect(res.body.data.criteria).toHaveLength(2);
  });

  it("403s when a non-owner tries to edit", async () => {
    const authorToken = await getAuthorToken();
    const reviewerToken = await getReviewerToken();
    const submission = await createSubmission(authorToken);

    const res = await request(app)
      .put(`/api/submissions/${submission.id}`)
      .set("x-test-clerk-user-id", reviewerToken)
      .send({
        title: "Hijacked",
        description: "This edit should be rejected since the reviewer does not own it.",
        githubUrl: "https://github.com/someuser/test-repo",
        technologies: ["vue"],
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("404s before checking ownership when the submission does not exist", async () => {
    const authorToken = await getAuthorToken();

    const res = await request(app)
      .put("/api/submissions/999999999")
      .set("x-test-clerk-user-id", authorToken)
      .send({
        title: "Does not matter",
        description: "The submission this targets does not exist.",
        githubUrl: "https://github.com/someuser/test-repo",
        technologies: ["vue"],
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("400s when criteria is included in the edit body", async () => {
    const authorToken = await getAuthorToken();
    const submission = await createSubmission(authorToken);

    const res = await request(app)
      .put(`/api/submissions/${submission.id}`)
      .set("x-test-clerk-user-id", authorToken)
      .send({
        title: "Trying to sneak criteria in",
        description: "This request illegally includes a criteria key.",
        githubUrl: "https://github.com/someuser/test-repo",
        technologies: ["vue"],
        criteria: [{ label: "New sneaky criterion" }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("no DELETE surface for submissions (INV-4)", () => {
  it("responds with the 404 envelope, not a method-not-allowed", async () => {
    const authorToken = await getAuthorToken();
    const submission = await createSubmission(authorToken);

    const res = await request(app)
      .delete(`/api/submissions/${submission.id}`)
      .set("x-test-clerk-user-id", authorToken);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
