/**
 * globalSetup.ts — runs ONCE before the entire test suite (not per file).
 * Use this for things like: starting a test server, seeding a test DB,
 * or setting up shared resources that survive across all test files.
 *
 * Note: This file runs in a separate context — no access to vi.mock() here.
 * Put per-test mocks in vitest.setup.ts instead.
 */

export async function setup() {
  // Set test environment variables before anything loads
  process.env["NODE_ENV"] = "test";
  process.env["PORT"] = "0"; // Random port — avoids conflicts

}

export async function teardown() {
  // Database cleanup belongs to the database-test helper, not global setup.
}
