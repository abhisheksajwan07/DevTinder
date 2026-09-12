import http from "k6/http";
import { check, sleep } from "k6";
import { StressThresholds } from "../config/thresholds.js";
import { BASE_URL } from "../helpers/auth.js";


const SEED_USER_COUNT = 200; // must match seedLoadTestUsers(count) in load-test.seed.ts

export const options = {
  stages: [
    { duration: "30s", target: 20  },
    { duration: "1m",  target: 50  },
    { duration: "1m",  target: 100 }, 
    { duration: "1m",  target: 200 }, 
    { duration: "30s", target: 0   }, 
  ],
  thresholds: StressThresholds,
};

export default function () {
 
  const userIndex = ((__VU - 1) % SEED_USER_COUNT) + 1;
  const email = `loadtest_${userIndex}@devtinder.local`;
  const password = "Password@123";

  const payload = JSON.stringify({
    email,
    password,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(`${BASE_URL}/v1/auth/signin`, payload, params);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has accessToken cookie or body": (r) =>
      r.cookies["accessToken"] !== undefined || r.json("accessToken") !== undefined,
  });

 // pause before next req.
  sleep(1);
}
