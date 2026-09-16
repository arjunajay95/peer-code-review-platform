import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/prisma.js", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import prisma from "../config/prisma.js";
import { deriveUsername } from "./deriveUsername.js";

const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockFindMany = vi.mocked(prisma.user.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("deriveUsername", () => {
  it("returns the base username when no collision exists", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await deriveUsername("user_abc123XYZ");
    expect(result).toBe("userabc123xyz");
  });

  it("appends 2 on the first collision", async () => {
    mockFindUnique.mockResolvedValue({ id: 1 } as never);
    mockFindMany.mockResolvedValue([{ username: "userabc123xyz" }] as never);

    const result = await deriveUsername("user_abc123XYZ");
    expect(result).toBe("userabc123xyz2");
  });

  it("increments past the highest existing suffix", async () => {
    mockFindUnique.mockResolvedValue({ id: 1 } as never);
    mockFindMany.mockResolvedValue([
      { username: "userabc123xyz" },
      { username: "userabc123xyz2" },
      { username: "userabc123xyz3" },
    ] as never);

    const result = await deriveUsername("user_abc123XYZ");
    expect(result).toBe("userabc123xyz4");
  });

  it("falls back to 'user' base when clerkId produces no alphanumeric chars", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await deriveUsername("___---!!!---___");
    expect(result).toBe("user");
  });

  it("truncates base to 20 characters", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await deriveUsername("averylongclerkidthatexceedstwentycharacters");
    expect(result.length).toBeLessThanOrEqual(20);
  });
});
