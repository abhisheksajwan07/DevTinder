import http from 'k6/http';
import { check } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

/**
 * Authenticates a test user and returns cookies / auth headers
 */
export function authenticateUser(email, password) {
  const payload = JSON.stringify({
    email: email || 'testuser@example.com',
    password: password || 'Password@123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/v1/auth/signin`, payload, params);

  check(res, {
    'auth signin successful': (r) => r.status === 200,
  });

  return {
    cookies: res.cookies,
    status: res.status,
  };
}
