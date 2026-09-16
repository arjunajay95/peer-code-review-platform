// Database helper for integration tests.
// Uses DATABASE_URL_TEST so tests never touch the dev or production database.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

if (!process.env.DATABASE_URL_TEST) {
  throw new Error(
    "DATABASE_URL_TEST is not set. Integration tests require a separate test database.",
  );
}

// Override DATABASE_URL with the test database before the app's prisma
// singleton is instantiated. Must happen before any import that touches prisma.
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_TEST,
});

export const testPrisma = new PrismaClient({ adapter });

export async function cleanTestUsers(clerkIds: string[]): Promise<void> {
  if (clerkIds.length === 0) return;
  await testPrisma.user.deleteMany({
    where: { clerkId: { in: clerkIds } },
  });
}
