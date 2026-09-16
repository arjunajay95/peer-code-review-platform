import "./helpers/db.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import type { Test } from "supertest";
import app from "../app.js";
import { testPrisma, cleanTestUsers } from "./helpers/db.js";
import { createTestClerkUser, deleteTestClerkUser, type TestClerkUser } from "./helpers/clerk.js";

let userA: TestClerkUser;
let userB: TestClerkUser;
const clerkIdsToClean: string[] = [];

function withAuth(req: Test, user: TestClerkUser): Test {
  return req.set("X-Test-Clerk-User-Id", user.clerkId);
}

beforeAll(async () => {
  userA = await createTestClerkUser("user-a");
  userB = await createTestClerkUser("user-b");
  clerkIdsToClean.push(userA.clerkId, userB.clerkId);
});

afterAll(async () => {
  await cleanTestUsers(clerkIdsToClean);
  await deleteTestClerkUser(userA.clerkId).catch(() => {});
  await deleteTestClerkUser(userB.clerkId).catch(() => {});
  await testPrisma.$disconnect();
});

describe("GET /api/health", () => {
  it("returns the success envelope", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: "ok" } });
  });
});

describe("GET /api/technologies", () => {
  it("returns a list without auth", async () => {
    const res = await request(app).get("/api/technologies");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it("response never contains clerkId", async () => {
    const res = await request(app).get("/api/technologies");
    expect(JSON.stringify(res.body)).not.toContain("clerkId");
  });
});

describe("GET /api/users/me", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
  it("first request creates exactly one local user row", async () => {
    const before = await testPrisma.user.count({ where: { clerkId: userA.clerkId } });
    expect(before).toBe(0);
    const res = await withAuth(request(app).get("/api/users/me"), userA);
    expect(res.status).toBe(200);
    expect(await testPrisma.user.count({ where: { clerkId: userA.clerkId } })).toBe(1);
  });
  it("second request reuses the same row (count stays at 1)", async () => {
    await withAuth(request(app).get("/api/users/me"), userA);
    expect(await testPrisma.user.count({ where: { clerkId: userA.clerkId } })).toBe(1);
  });
  it("response never contains clerkId", async () => {
    const res = await withAuth(request(app).get("/api/users/me"), userA);
    expect(JSON.stringify(res.body)).not.toContain("clerkId");
  });
  it("response contains expected profile fields", async () => {
    const res = await withAuth(request(app).get("/api/users/me"), userA);
    expect(res.body.data).toMatchObject({ username: expect.any(String), karma: 0, technologies: expect.any(Array) });
    expect(res.body.data).not.toHaveProperty("clerkId");
  });
});

describe("PATCH /api/users/me", () => {
  it("updates bio and githubUrl successfully", async () => {
    await withAuth(request(app).get("/api/users/me"), userA);
    const res = await withAuth(request(app).patch("/api/users/me"), userA)
      .send({ bio: "Integration test bio", githubUrl: "https://github.com/testuser" });
    expect(res.status).toBe(200);
    expect(res.body.data.bio).toBe("Integration test bio");
  });
  it("returns 400 VALIDATION_ERROR on unknown key", async () => {
    const res = await withAuth(request(app).patch("/api/users/me"), userA).send({ unknownField: "hacker" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
  it("returns 400 VALIDATION_ERROR when clerkId sent (identity field)", async () => {
    const res = await withAuth(request(app).patch("/api/users/me"), userA).send({ clerkId: "user_fake" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
  it("returns 400 VALIDATION_ERROR when karma sent (identity field)", async () => {
    const res = await withAuth(request(app).patch("/api/users/me"), userA).send({ karma: 9999 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
  it("response never contains clerkId", async () => {
    const res = await withAuth(request(app).patch("/api/users/me"), userA).send({ bio: "Updated bio" });
    expect(JSON.stringify(res.body)).not.toContain("clerkId");
  });
});

describe("GET /api/users/:username", () => {
  it("returns public profile without auth", async () => {
    const meRes = await withAuth(request(app).get("/api/users/me"), userA);
    const { username } = meRes.body.data as { username: string };
    const res = await request(app).get(`/api/users/${username}`);
    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe(username);
    expect(JSON.stringify(res.body)).not.toContain("clerkId");
  });
  it("returns 404 for non-existent username", async () => {
    const res = await request(app).get("/api/users/this-user-does-not-exist-xyz");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("username collision suffixing", () => {
  it("two users have distinct usernames", async () => {
    await withAuth(request(app).get("/api/users/me"), userB);
    const users = await testPrisma.user.findMany({
      where: { clerkId: { in: [userA.clerkId, userB.clerkId] } },
      select: { username: true },
    });
    expect(users.length).toBe(2);
    expect(new Set(users.map((u) => u.username)).size).toBe(2);
  });
});

describe("GET /api/users/me/submissions", () => {
  it("returns empty paginated list", async () => {
    const res = await withAuth(request(app).get("/api/users/me/submissions"), userA);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta).toMatchObject({ page: 1, limit: 20, total: 0, totalPages: 0 });
    expect(JSON.stringify(res.body)).not.toContain("clerkId");
  });
});

describe("GET /api/users/me/reviews", () => {
  it("returns empty paginated list", async () => {
    const res = await withAuth(request(app).get("/api/users/me/reviews"), userA);
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(0);
  });
});

describe("GET /api/users/me/reviews-received", () => {
  it("returns empty paginated list", async () => {
    const res = await withAuth(request(app).get("/api/users/me/reviews-received"), userA);
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(0);
  });
});
