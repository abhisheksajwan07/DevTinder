import { describe, test, it, expect } from "vitest";
import { comparePassword, hashPassword } from "../../utils/password.js";

describe("hashPassword", () => {
  it("should return a hashed password", async () => {
    const password = "hashPassword123";
    const hash = await hashPassword(password);

    expect(hash).toEqual(expect.any(String));
    expect(hash).not.toBe(password);
  });
});

describe("comparePassword", () => {
  it("should return true for the correct password", async () => {
    const password = "hashPassword123";
    const hash = await hashPassword(password);

    const result = await comparePassword(password, hash);

    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const password = "hashPassword123";
    const hash = await hashPassword(password);

    const result = await comparePassword("wrongPassword", hash);

    expect(result).toBe(false);
  });
});
