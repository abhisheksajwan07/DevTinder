import http from 'k6/http';
import { check, sleep } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';



export const options = {
  stages: [
    { duration: '15s', target: 10 }, 
    { duration: '30s', target: 30 }, 
    { duration: '15s', target: 0 },  
  ],
  thresholds: {
    
    http_req_duration: ['p(95)<350', 'p(99)<700'],
    
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  
  const userIndex = ((__VU - 1) % 50) + 1;
  const email = `loadtest_${userIndex}@devtinder.local`;
  const password = 'Password@123';

  const payload = JSON.stringify({
    email,
    password,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/v1/auth/signin`, payload, params);

  // Assert response
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has accessToken cookie or body': (r) =>
      r.cookies['accessToken'] !== undefined || r.json('accessToken') !== undefined,
  });

  // Realistic human pause before next action (1 to 2 seconds)
  sleep(1);
}
