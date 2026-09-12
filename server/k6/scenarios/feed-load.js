import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import { LoadThresholds } from "../config/thresholds.js";
import { BASE_URL, authenticateUser, extractCookies } from "../helpers/auth.js";


const feedDuration = new Trend("feed_req_duration", true);
const feedReadyRate = new Rate("feed_ready_rate");
const feedPreparingCount = new Counter("feed_preparing_503");
const rateLimitCount = new Counter("rate_limited_429");

export const options = {
  stages: [
    // { duration: "20s", target: 20 },
    // { duration: "1m", target: 50 },
    // { duration: "20s", target: 0 },
    { duration: "30s", target: 20 },
    { duration: "1m", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "1m", target: 200 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    ...LoadThresholds,
    feed_req_duration: ["p(95)<300"],
    feed_ready_rate: ["rate>0.95"],
    http_req_failed: ["rate<0.02"],
  },
};

export function setup() {
  const testUserCount = 50;

  const batchRequests = Array.from({ length: testUserCount }, (_, i) => {
    const email = `loadtest_${i + 1}@devtinder.local`;
    return {
      method: "POST",
      url: `${BASE_URL}/v1/auth/signin`,
      body: JSON.stringify({
        email: email,
        password: "Password@123",
      }),
      params: {
        headers: { "Content-Type": "application/json" },
      },
    };
  });

  const responses = http.batch(batchRequests);

  const userSessions = [];
  responses.forEach((res, index) => {
    if (res.status === 200) {
      const { cookieHeader, cookieMap } = extractCookies(res);
      userSessions.push({
        email: `loadtest_${index + 1}@devtinder.local`,
        cookieHeader,
        cookies: cookieMap,
      });
    }
  });

  if (userSessions.length === 0) {
    const fallbackAuth = authenticateUser(
      "testuser@example.com",
      "Password@123",
    );
    if (fallbackAuth.status === 200) {
      userSessions.push({
        email: "testuser@example.com",
        cookieHeader: fallbackAuth.cookieHeader,
        cookies: fallbackAuth.cookies,
      });
    } else {
      throw new Error(
        'Feed load test setup failed: could not authenticate any test user. Run "npm run db:seed:load-test" first.',
      );
    }
  }

  console.log(
    `[Feed Load Test] Initialized with ${userSessions.length} unique user sessions.`,
  );
  return { userSessions };
}

export default function (data) {
  
  const sessionIndex = (__VU - 1) % data.userSessions.length;
  const session = data.userSessions[sessionIndex];

  const params = {
    headers: {
      "Content-Type": "application/json",
      Cookie: session.cookieHeader,
    },
  };

  // Typical feed queries request 10 to 20 profiles at a time
  const limit = Math.random() < 0.8 ? 10 : 20;
  const res = http.get(`${BASE_URL}/v1/feed?limit=${limit}`, params);

  feedDuration.add(res.timings.duration);

  
  if (__VU === 1 && __ITER === 0) {
    console.log(`\n--- [DEBUG FIRST FEED REQUEST] ---`);
    console.log(
      `Sending Cookie: ${session.cookieHeader ? session.cookieHeader.substring(0, 45) + "..." : "NONE"}`,
    );
    console.log(`Status Received: ${res.status}`);
    console.log(`Body: ${res.body ? res.body.substring(0, 150) : "EMPTY"}`);
    console.log(`------------------------------------\n`);
  } else if (res.status !== 200 && res.status !== 503) {
    console.log(
      `[FEED REQUEST ERROR] Status: ${res.status} | Body: ${res.body}`,
    );
  }

  if (res.status === 200) {
    feedReadyRate.add(1);
  } else {
    feedReadyRate.add(0);
    if (res.status === 503) feedPreparingCount.add(1);
    if (res.status === 429) rateLimitCount.add(1);
  }

  check(res, {
    "status is 200 or 503": (r) => r.status === 200 || r.status === 503,
    "feed profiles is array on 200": (r) => {
      if (r.status !== 200) return true;
      try {
        const json = r.json();
        return Array.isArray(json?.data?.profiles);
      } catch (_) {
        return false;
      }
    },
    "response time < 300ms": (r) => r.timings.duration < 300,
  });

  sleep(1.5 + Math.random() * 1.5);
}
