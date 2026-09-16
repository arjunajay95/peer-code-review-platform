import { defineConfig } from "vitest/config";
import { config } from "dotenv";

config();

export default defineConfig({
  test: {
    testTimeout: 30000,
    fileParallelism: false,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.integration.test.ts",
      "**/*.integration.test.js",
    ],
  },
});
