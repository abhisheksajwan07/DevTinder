/**
 * Do not use a generic Drizzle-chain mock in this project. It quickly drifts
 * away from the real schema and can make a broken query appear to work.
 *
 * - Unit-test services by mocking their repository interface.
 * - Test repositories against the dedicated PostgreSQL test database.
 *
 * Keep fake users/profiles beside the tests that use them, so their fields
 * always match the module under test.
 */
export {};
