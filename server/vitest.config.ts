import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use Node environment (not jsdom)
    environment: "node",

    // Global setup file — runs once before all test suites
    globalSetup: "./src/__tests__/setup/globalSetup.ts",

    // Per-file setup — runs before each test file
    setupFiles: ["./src/__tests__/setup/vitest.setup.ts"],

    // Include pattern for test files
    include: ["src/__tests__/**/*.test.ts"],

    // Globals like describe/it/expect without imports
    globals: true,

    // Coverage config
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/__tests__/**",
        "src/server.ts",
        "src/worker.ts",
        "src/db/seeds/**",
        "src/db/migrate.ts",
      ],
      reportsDirectory: "./coverage",
    },

    // Timeout per test (ms)
    testTimeout: 10000,

    // Show test results per file
    reporters: "verbose",
  },
});
