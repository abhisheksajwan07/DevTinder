import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { requireCsrf } from "../../middleware/csrf.middleware.js";
import { AppError } from "../../utils/AppError.js";

function runCsrfMiddleware(cookies: Record<string, string>, header?: string) {
  const next = vi.fn();
  const req = {
    cookies,
    headers: header ? { "x-csrf-token": header } : {},
  } as unknown as Request;

  requireCsrf(req, {} as Response, next as NextFunction);
  return next;
}

describe("requireCsrf", () => {
  it("continues when the cookie and request header match", () => {
    const next = runCsrfMiddleware({ csrfToken: "test-token" }, "test-token");

    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a missing or mismatched token", () => {
    const next = runCsrfMiddleware({ csrfToken: "cookie-token" }, "header-token");

    const error = next.mock.calls[0]?.[0];
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({statusCode:403})
  });
});
