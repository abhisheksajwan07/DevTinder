import http from "k6/http";
import { check } from "k6";

export const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export function extractCookies(res) {
  const accessToken = res.cookies.accessToken?.[0]?.value ?? "";
  const refreshToken = res.cookies.refreshToken?.[0]?.value ?? "";
  const csrfToken = res.cookies.csrfToken?.[0]?.value ?? "";

  return {
    accessToken,
    refreshToken,
    csrfToken,
    cookies: { accessToken, refreshToken, csrfToken },
    cookieMap: { accessToken, refreshToken, csrfToken },
    cookieHeader: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
  };
}

export function authenticateUser(email, password) {
  const payload = JSON.stringify({
    email: email || "testuser@example.com",
    password: password || "Password@123",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(`${BASE_URL}/v1/auth/signin`, payload, params);

  const { cookieMap, cookieHeader, csrfToken } = extractCookies(res);

  check(res, {
    "auth signin successful": (r) => r.status === 200,
  });

  return {
    cookies: cookieMap,
    cookieHeader,
    csrfToken,
    status: res.status,
  };
}
