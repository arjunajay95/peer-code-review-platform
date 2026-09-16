import prisma from "../config/prisma.js";

// Derives a local username from a Clerk userId.
// Lowercases and strips non-alphanumeric characters, then appends a
// numeric suffix if the candidate is already taken (D-12).
export async function deriveUsername(clerkId: string): Promise<string> {
  const base = clerkId.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "user";

  const existing = await prisma.user.findUnique({ where: { username: base } });
  if (!existing) {
    return base;
  }

  // Find the highest existing suffix for this base and increment it.
  const siblings = await prisma.user.findMany({
    where: { username: { startsWith: base } },
    select: { username: true },
  });

  const suffixes = siblings
    .map((u) => {
      const match = u.username.slice(base.length).match(/^(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const next = suffixes.length > 0 ? Math.max(...suffixes) + 1 : 2;
  return `${base}${next}`;
}
