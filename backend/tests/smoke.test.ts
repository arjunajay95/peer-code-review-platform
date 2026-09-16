import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { getAuthorToken } from "./helpers/auth.js";

describe("smoke", () => {
  it("GET /api/health returns the envelope", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: "ok" } });
  });

  it("POST /api/submissions succeeds against the reset test database", async () => {
    const token = await getAuthorToken();

    const res = await request(app)
      .post("/api/submissions")
      .set("x-test-clerk-user-id", token)
      .send({
        title: "Smoke Test Submission",
        description: "Confirms the integration pipeline is wired correctly end to end.",
        githubUrl: "https://github.com/someuser/smoke-test",
        technologies: ["react"],
        criteria: [{ label: "Code readability" }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Smoke Test Submission");
  });
});
