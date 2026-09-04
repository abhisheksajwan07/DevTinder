import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../config/redis.js", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));
import { redis } from "../../config/redis.js";

import {
  generateResetToken,
  hashResetToken,
  storeResetToken,
  getResetTokenUserId,
  deleteResetToken,
} from "../../module/auth/auth.utils.js";

describe("auth utils testing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateResetToken", () => {
    it("should generate a reset token", () => {
      const token = generateResetToken();

      expect(token).toEqual(expect.any(String));
      expect(token).toHaveLength(64);
    });

    it("should generate different tokens", () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe("hashResetToken", () => {
    it("should have reset token", () => {
      const resetToken = generateResetToken();
      const hash = hashResetToken(resetToken);

      expect(hash).toEqual(expect.any(String));
      expect(hash).toHaveLength(64);
    });

    it("should produce the same hash for the same token", () => {
      const token = "test-reset-token";
      const hash1 = hashResetToken(token);
      const hash2 = hashResetToken(token);
      expect(hash1).toBe(hash2);
    });
  });

  describe("storeResetToken", async () => {
    it("should store token-to-user and user-to-token mappings", async () => {
      vi.mocked(redis.get).mockResolvedValue(null);

      await storeResetToken("new-token-hash", "user-123");

      expect(redis.set).toHaveBeenCalledWith(
        "reset:new-token-hash",
        "user-123",
        "EX",
        15 * 60,
      );

      expect(redis.set).toHaveBeenCalledWith(
        "reset:user:user-123",
        "new-token-hash",
        "EX",
        15 * 60,
      );
    });

    it("should invalidate the existing old token", async () => {
      vi.mocked(redis.get).mockResolvedValue("old-token-hash");

      await storeResetToken("new-token-hash", "user-123");

      expect(redis.del).toHaveBeenCalledWith("reset:old-token-hash");

      expect(redis.set).toHaveBeenCalledWith(
        "reset:new-token-hash",
        "user-123",
        "EX",
        15 * 60,
      );

      expect(redis.set).toHaveBeenCalledWith(
        "reset:user:user-123",
        "new-token-hash",
        "EX",
        15 * 60,
      );
    });
  });

  describe("getResetTokenUserId", () => {
    it("should return the user Id for a token hash", async () => {
      vi.mocked(redis.get).mockResolvedValue("user-123");

      //suppose u have two get
      // vi.mocked(redis.get)
      // .mockResolvedValueOnce("user-123") -first get
      //.mockResolvedValueOnce("some-value");- 2nd get
      const result = await getResetTokenUserId("token-hash");

      expect(result).toBe("user-123");
      expect(redis.get).toHaveBeenCalledWith("reset:token-hash");
     
    });

    it("should delete only token mapping when token doesn't exist", async () => {
      vi.mocked(redis.get).mockResolvedValue(null);

      await deleteResetToken("token-hash");
      expect(redis.get).toHaveBeenCalledWith("reset:token-hash");
      expect(redis.del).toHaveBeenCalledWith("reset:token-hash");
    });
  });

});
