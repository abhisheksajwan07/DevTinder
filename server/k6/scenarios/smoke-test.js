import http from 'k6/http';
import { check, sleep } from 'k6';
import { SmokeThresholds } from '../config/thresholds.js';
import { BASE_URL } from '../helpers/auth.js';

// Smoke test: 1 Virtual User for 30s to verify all endpoints respond without errors
export const options = {
  vus: 1,
  duration: '30s',
  thresholds: SmokeThresholds,
};

export default function () {
  // Tell k6 that 401 is expected so it does not count as http_req_failed
  const params = {
    responseCallback: http.expectedStatuses(401),
  };

  const res = http.get(`${BASE_URL}/v1/auth/me`, params);
  
  // Verify 401 is returned when unauthenticated (expected behavior)
  check(res, {
    'unauth request rejected with 401': (r) => r.status === 401,
  });

  sleep(1);
}
