import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";

import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import { verifyAccessToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/AppError.js";

vi.mock("../../utils/jwt.js");

const accessAuth = (cookies: Record<string, string>) => {
  const next = vi.fn();
  const req = {
    cookies,
  } as unknown as Request;

  requireAccessAuth(req, {} as Response, next as NextFunction);
  return { next, req };
};

describe("requireAccessAuth", () => {
  it("allow the req. with  valid access token", () => {
    vi.mocked(verifyAccessToken).mockReturnValue({
      sub: "user-123",
      sessionId: "session-123",
    });
    const { next, req } = accessAuth({ accessToken: "access-token" });
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({
      userId: "user-123",
      sessionId: "session-123",
    });
  });

  it("rejects the request without an access token", () => {
    const { next } = accessAuth({});
    const error = next.mock.calls[0]?.[0];
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ statusCode: 401 });
  });

  it("reject an expired access token", () => {
    vi.mocked(verifyAccessToken).mockImplementation(() => {
      throw new jwt.TokenExpiredError("jwt expired", new Date());
    });

    const { next } = accessAuth({
      accessToken: "expired-token",
    });

    const error = next.mock.calls[0]?.[0];
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: "Access token expired",
    });
  });

  it("reject an invalid access token", () => {
    vi.mocked(verifyAccessToken).mockImplementation(() => {
      throw new jwt.JsonWebTokenError("invalid token");
    });
    const { next } = accessAuth({
      accessToken: "invalid token",
    });
    const error = next.mock.calls[0]?.[0];
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 401,
      message: "Invalid token",
    });
  });
});
