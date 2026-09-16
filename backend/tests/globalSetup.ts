import { execSync } from "node:child_process";
import { config as loadEnv } from "dotenv";

export default function setup() {
  loadEnv();

  // The one sanctioned delete in the project (D-03), and it must never
  // point anywhere but the TEST database. This Prisma version has no
  // --skip-seed flag, so the configured seed runs after every reset,
  // giving tests the same deterministic baseline as local dev.
  execSync("npx prisma migrate reset --force", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST },
  });
}
