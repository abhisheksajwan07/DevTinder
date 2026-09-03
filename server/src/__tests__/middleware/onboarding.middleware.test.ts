import type { NextFunction, Request, Response } from "express";

import { beforeEach, describe, expect, it, vi } from "vitest";


// Mock authService to prevent its real dependencies (redis/db) from
// being initialized during this unit test.
vi.mock("../../module//auth/auth.dependencies.js", () => ({
  authService: {
    getMe: vi.fn(),
  },
}));

import { requireOnboarding } from "../../middleware/onboarding.middleware.js";
import { authService } from "../../module/auth/auth.dependencies.js";

describe("requireOnboarding middleware", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should throw 401 if user is not authenticated", async () => {
    const req = { user: undefined } as Request;
    const res = {} as Response;
    const next = vi.fn();

    await expect(requireOnboarding(req, res, next)).rejects.toMatchObject({
      statusCode: 401,
      message: "Unauthorized",
    });

    expect(authService.getMe).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw 403 if onboarding is incomplete", async () => {
    const req = { user: { userId: "user-1" } } as Request;
    const res = {} as Response;
    const next = vi.fn();

    vi.mocked(authService.getMe).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      onBoardingComplete: false,
      profileId: null,
    });

    await expect(requireOnboarding(req, res, next)).rejects.toMatchObject({
      message: "Please complete onboarding first",
      statusCode: 403,
      code: "ONBOARDING_REQUIRED",
    });

    expect(authService.getMe).toHaveBeenCalledWith("user-1");
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow user who has completed onboarding", async () => {
    const req = { user: { userId: "user-2" } } as Request;
    const res = {} as Response;
    const next = vi.fn();

    vi.mocked(authService.getMe).mockResolvedValue({
      id: "user-2",
      email: "test@example.com",
      onBoardingComplete: true,
      profileId: "profile-1234",
    });

    await requireOnboarding(req, res, next);

    expect(authService.getMe).toHaveBeenCalledWith("user-2");
    expect(req.user?.profileId).toBe("profile-1234");
    expect(next).toHaveBeenCalledOnce();
  });
});
