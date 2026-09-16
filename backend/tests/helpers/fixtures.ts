import request from "supertest";
import app from "../../src/app.js";

export async function createSubmission(token: string, overrides: Record<string, unknown> = {}) {
  const res = await request(app)
    .post("/api/submissions")
    .set("x-test-clerk-user-id", token)
    .send({
      title: "Test Submission",
      description: "A submission created as an integration test fixture.",
      githubUrl: "https://github.com/someuser/test-repo",
      technologies: ["react"],
      criteria: [{ label: "Code readability" }, { label: "Test coverage" }],
      ...overrides,
    });

  return res.body.data;
}
