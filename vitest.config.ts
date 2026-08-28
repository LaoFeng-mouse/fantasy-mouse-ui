import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/plugin/**/*.test.ts"],
    exclude: [".worktrees/**", "node_modules/**", "dist/**"],
  },
});
