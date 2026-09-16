import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { getReviewerToken } from "./helpers/auth.js";
describe("write rate limiting (D-19, D-10 429 row)", () => {
  it("429s in the envelope once the write limit is exceeded", async () => {
    const token = await getReviewerToken();
    const limit = Number(process.env.RATE_LIMIT_WRITE_TEST);
    let lastResponse;
    for (let i = 0; i < limit + 1; i++) {
      lastResponse = await request(app)
        .post("/api/submissions")
        .set("x-test-clerk-user-id", token)
        .send({
          title: `Rate limit probe ${i}`,
          description: "Fired repeatedly on purpose to exceed the write rate limit.",
          githubUrl: "https://github.com/someuser/rate-limit-probe",
          technologies: ["react"],
          criteria: [{ label: "Code quality" }],
        });
    }
    expect(lastResponse!.status).toBe(429);
    expect(lastResponse!.body.error.code).toBe("RATE_LIMITED");
  });
});
