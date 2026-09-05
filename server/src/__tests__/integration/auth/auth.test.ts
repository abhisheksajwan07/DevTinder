import request from "supertest";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { createTestApp } from "../../setup/testApp.js";
import { db } from "../../../db/drizzle.js";
import { users } from "../../../db/schema/users.schema.js";
import { emailCredentials } from "../../../db/schema/auth.schema.js";
import { eq } from "drizzle-orm";
import { redis } from "../../../config/redis.js";

// email mock prevent real email jobs from being enqueued during tests
vi.mock("../../../queues/email.queue.js", () => ({
  emailQueue: {
    add: vi.fn().mockResolvedValue(true),
  },
}));

const app = createTestApp();

const TEST_EMAIL = "integration@test.com";
const VALID_PASSWORD = "password123!";

/** Register a user and return the raw response */
async function signUp(email = TEST_EMAIL, password = VALID_PASSWORD) {
  return request(app).post("/v1/auth/signup").send({ email, password });
}

/**
 * Seed a fully verified user directly in the DB so login tests don't
 * depend on the OTP verification flow being correct.
 */
async function seedVerifiedUser(
  email = TEST_EMAIL,
  password = VALID_PASSWORD,
): Promise<string> {
  //  user + email
  await signUp(email, password);

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("Test user was not created");
  }
  await db
    .update(emailCredentials)
    .set({ isVerified: true })
    .where(eq(emailCredentials.userId, user.id));

  return user.id;
}

/** remove test and related redis key*/
async function cleanUp(email = TEST_EMAIL) {
  await db.delete(users).where(eq(users.email, email));
  await redis.del(
    `otp:${email}`,
    `otp_attempts:${email}`,
    `otp_resend_cooldown:${email}`,
    `reset_cooldown:${email}`,
  );
}

describe("Auth Integration Tests", () => {
  beforeEach(() => cleanUp());
  afterEach(() => cleanUp());

  //POST /signup

  describe("POST /v1/auth/signup", () => {
    it("should create a new user and return 201", async () => {
      const res = await signUp();
      expect(res.status).toBe(201);
      expect(res.body.message).toBe(
        "SignUp completed ! Check your email for verification",
      );
    });

    it("should return 409 when the email is already taken (verified)", async () => {
      await seedVerifiedUser();
      const res = await signUp();
      expect(res.status).toBe(409);
    });

    it("should return 409 with EMAIL_NOT_VERIFIED when account exists but is unverified", async () => {
      await signUp(); // first signup — unverified
      const res = await signUp(); // second attempt same email
      expect(res.status).toBe(409);
      expect(res.body.code).toBe("EMAIL_NOT_VERIFIED");
    });
  });

  //POST /signin

  describe("POST /v1/auth/signin", () => {
    it("should return 401 for a non-exist user", async () => {
      const res = await request(app)
        .post("/v1/auth/signin")
        .send({ email: "ghost@test.com", password: VALID_PASSWORD });
      expect(res.status).toBe(401);
      expect(res.body.code).toBe("INVALID_CREDENTIALS");
    });

    it("should return 403 when user exists but email is not verified", async () => {
      await signUp(); // unverified
      const res = await request(app)
        .post("/v1/auth/signin")
        .send({ email: TEST_EMAIL, password: VALID_PASSWORD });
      expect(res.status).toBe(403);
      expect(res.body.code).toBe("EMAIL_NOT_VERIFIED");
    });

    it("should return 401 for wrong password on a verified account", async () => {
      await seedVerifiedUser();
      const res = await request(app)
        .post("/v1/auth/signin")
        .send({ email: TEST_EMAIL, password: "WrongPass999!" });
      expect(res.status).toBe(401);
      expect(res.body.code).toBe("INVALID_CREDENTIALS");
    });

    it("should return 200 with accessToken for valid credentials", async () => {
      await seedVerifiedUser();
      const res = await request(app)
        .post("/v1/auth/signin")
        .send({ email: TEST_EMAIL, password: VALID_PASSWORD });
      expect(res.status).toBe(200);

      expect(res.body.data.user).toMatchObject({ email: TEST_EMAIL });
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should lock the account after 5 failed login attempts", async () => {
      await seedVerifiedUser();
      const wrongCreds = { email: TEST_EMAIL, password: "Wrong111!" };

      for (let i = 0; i < 5; i++) {
        await request(app).post("/v1/auth/signin").send(wrongCreds);
      }

      // 6th attempt lock acc
      const res = await request(app).post("/v1/auth/signin").send(wrongCreds);
      expect(res.status).toBe(423);
    });
  });

  //POST /verify-email

  describe("POST /v1/auth/verify-email", () => {
    it("should return 400 for an incorrect OTP", async () => {
      await signUp();
      const res = await request(app).post("/v1/auth/verify-email").send({
        email: TEST_EMAIL,
        otp: "000000",
      });
      expect(res.status).toBe(400);
    });

    it("should return 429 after 5 consecutive wrong OTP attempts (OTP_RATE_LIMITED)", async () => {
      await signUp();

      for (let i = 0; i < 5; i++) {
        await request(app)
          .post("/v1/auth/verify-email")
          .send({ email: TEST_EMAIL, otp: "000000" });
      }

      const res = await request(app).post("/v1/auth/verify-email").send({
        email: TEST_EMAIL,
        otp: "000000",
      });
      expect(res.status).toBe(429);
      expect(res.body.code).toBe("OTP_RATE_LIMITED");
    });

    it("should verify email successfully with the correct OTP", async () => {
      await signUp();
      const otp = await redis.get(`otp:${TEST_EMAIL}`);
      expect(otp).toBeTruthy();

      const res = await request(app).post("/v1/auth/verify-email").send({
        email: TEST_EMAIL,
        otp,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Email verified successfully.");
      expect(res.body.data.user.email).toBe(TEST_EMAIL);
    });
  });

  //POST /resend-verification-otp

  describe("POST /v1/auth/resend-verification-otp", () => {
    it("should return 404 for an email that was never registered", async () => {
      const res = await request(app)
        .post("/v1/auth/resend-verification-otp")
        .send({ email: "nobody@test.com" });
      expect(res.status).toBe(404);
    });

    it("should return 400 if the email is already verified (EMAIL_ALREADY_VERIFIED)", async () => {
      await seedVerifiedUser();
      const res = await request(app)
        .post("/v1/auth/resend-verification-otp")
        .send({ email: TEST_EMAIL });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe("EMAIL_ALREADY_VERIFIED");
    });

    it("should return 429 when the 60s resend cooldown is still active", async () => {
      await signUp();
      // First resend — starts cooldown
      await request(app)
        .post("/v1/auth/resend-verification-otp")
        .send({ email: TEST_EMAIL });

      // Immediate second resend → rate-limited
      const res = await request(app)
        .post("/v1/auth/resend-verification-otp")
        .send({ email: TEST_EMAIL });
      expect(res.status).toBe(429);
      expect(res.body.code).toBe("OTP_RESEND_RATE_LIMITED");
    });
  });

  //POST /forgot-password

  describe("POST /v1/auth/forgot-password", () => {
    it("should return 200 even for an email that doesn't exist (anti-enumeration)", async () => {
      const res = await request(app)
        .post("/v1/auth/forgot-password")
        .send({ email: "ghost@test.com" });

      expect(res.status).toBe(200);
    });

    it("should return 429 on a rapid consecutive request for the same verified email", async () => {
      await seedVerifiedUser();
      // 1st req trigger cooldown
      await request(app)
        .post("/v1/auth/forgot-password")
        .send({ email: TEST_EMAIL });

      //2nd req
      const res = await request(app)
        .post("/v1/auth/forgot-password")
        .send({ email: TEST_EMAIL });

      expect(res.status).toBe(429);
    });
  });

  // POST /reset-password

  describe("POST /v1/auth/reset-password", () => {
    it("should return 400 for an invalid / expired reset token", async () => {
      const res = await request(app).post("/v1/auth/reset-password").send({
        token: "totally-fake-token",
        newPassword: "NewPassword123!",
      });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_OR_EXPIRED_TOKEN");
    });
  });

  // getme
  describe("GET /v1/auth/me", () => {
    it("should return 401 when no auth token is provided", async () => {
      const res = await request(app).get("/v1/auth/me");
      expect(res.status).toBe(401);
    });

    it("should return 401 for a malformed / invalid Bearer token", async () => {
      const res = await request(app)
        .get("/v1/auth/me")
        .set("Authorization", "Bearer totally.invalid.token");
      expect(res.status).toBe(401);
    });

    it("should return 200 for a succesful GET /me after auth", async () => {
      await seedVerifiedUser();
      const loginRes = await request(app).post("/v1/auth/signin").send({
        email: TEST_EMAIL,
        password: VALID_PASSWORD,
      });

      expect(loginRes.status).toBe(200);

      const cookies = loginRes.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const res = await request(app).get("/v1/auth/me").set("Cookie", cookies!);

      expect(res.status).toBe(200);
    });
  });
});
