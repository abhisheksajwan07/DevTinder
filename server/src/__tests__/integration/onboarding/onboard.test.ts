import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

import { createTestApp } from "../../setup/testApp.js";
import { db, skills } from "../../../db/drizzle.js";
import {
  users,
  emailCredentials,
  avatars,
  profiles,
  interests,
  lookingFor,
} from "../../../db/drizzle.js";
import { redis } from "../../../config/redis.js";

// Background jobs are not part of this integration test.
vi.mock("../../../queues/embedding.queue.js", () => ({
  embeddingQueue: {
    add: vi.fn().mockResolvedValue(true),
  },
  createEmbeddingJobId: vi.fn((_profileId: string) => "test-job-id"),
}));

vi.mock("../../../queues/github-sync.queue.js", () => ({
  githubSyncQueue: {
    add: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("../../../queues/email.queue.js", () => ({
  emailQueue: {
    add: vi.fn().mockResolvedValue(true),
  },
}));

const app = createTestApp();

const TEST_EMAIL = "onboarding-integration@test.com";
const VALID_PASSWORD = "password123!";

async function seedVerifiedUserWithCookies(
  email = TEST_EMAIL,
  password = VALID_PASSWORD,
): Promise<{ userId: string; cookies: string[]; csrfToken: string }> {
  await request(app).post("/v1/auth/signup").send({ email, password });

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

  const signinRes = await request(app)
    .post("/v1/auth/signin")
    .send({ email, password });

  expect(signinRes.status).toBe(200);

  const cookies = signinRes.headers["set-cookie"] as unknown as string[];

  const csrfCookie = cookies.find((cookie) => cookie.startsWith("csrfToken="));
  const csrfToken = csrfCookie?.split(";")[0]?.split("=")[1] ?? "";

  return {
    userId: user.id,
    cookies,
    csrfToken,
  };
}

async function getOrCreateAvatarId(): Promise<string> {
  const [existing] = await db.select({ id: avatars.id }).from(avatars).limit(1);

  if (existing) {
    return existing.id;
  }

  const [inserted] = await db
    .insert(avatars)
    .values({
      key: "test_avatar_onboarding",
      displayName: "Test Avatar",
      gender: "neutral",
      style: "preset",
      imageUrl: null,
    })
    .returning({ id: avatars.id });

  return inserted!.id;
}

async function getFirstInterestId(): Promise<string> {
  const [row] = await db.select({ id: interests.id }).from(interests).limit(1);

  if (!row) {
    throw new Error("No interests seeded");
  }

  return row.id;
}

async function getFirstLookingForId(): Promise<string> {
  const [row] = await db
    .select({ id: lookingFor.id })
    .from(lookingFor)
    .limit(1);

  if (!row) {
    throw new Error("No lookingFor rows seeded");
  }

  return row.id;
}

async function getFirstSkillsId(): Promise<string> {
  const [row] = await db.select({ id: skills.id }).from(skills).limit(1);

  return row!.id;
}

async function buildProfilePayload(overrides: Record<string, unknown> = {}) {
  const avatarId = await getOrCreateAvatarId();
  const interestId = await getFirstInterestId();
  const lookingForId = await getFirstLookingForId();

  return {
    firstName: "Test",
    lastName: "Dev",
    userName: `testdev_${Date.now()}`,
    bio: "I build things",
    primaryRole: "fullstack",
    experienceLevel: "Mid",
    availability: "5_15_hours",
    avatarId,
    interestIds: [interestId],
    lookingForIds: [lookingForId],
    ...overrides,
  };
}

async function cleanUp() {
  await db.delete(users).where(eq(users.email, TEST_EMAIL));

  await redis.del(
    `otp:${TEST_EMAIL}`,
    `otp_attempts:${TEST_EMAIL}`,
    `otp_resend_cooldown:${TEST_EMAIL}`,
    `reset_cooldown:${TEST_EMAIL}`,
  );
}

describe("Onboarding Integration Tests", () => {
  beforeEach(async () => {
    await cleanUp();
  });

  afterEach(async () => {
    await cleanUp();
  });

  it("should create a profile and persist onboarding state", async () => {
    const { userId, cookies, csrfToken } = await seedVerifiedUserWithCookies();
    const skillId = await getFirstSkillsId()
    const payload = await buildProfilePayload({
      skillIds: [skillId],
      customSkills:["docker","CI-CD"]
    });

    const res = await request(app)
      .post("/v1/onboarding")
      .set("Cookie", cookies)
      .set("x-csrf-token", csrfToken)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Profile created successfully");

    const [profile] = await db
      .select({
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        userName: profiles.userName,
        bio: profiles.bio,
      })
      .from(profiles)
      .where(eq(profiles.userId, userId));

    expect(profile).toMatchObject({
      firstName: payload.firstName,
      lastName: payload.lastName,
      userName: payload.userName,
      bio: payload.bio,
    });

    const [user] = await db
      .select({
        onBoardingComplete: users.onBoardingComplete,
      })
      .from(users)
      .where(eq(users.id, userId));

    expect(user!.onBoardingComplete).toBe(true);
  });

  it("should update the profile and return the updated profile", async () => {
    const { cookies, csrfToken } = await seedVerifiedUserWithCookies();

    const payload = await buildProfilePayload();

    await request(app)
      .post("/v1/onboarding")
      .set("Cookie", cookies)
      .set("x-csrf-token", csrfToken)
      .send(payload);

    const patchRes = await request(app)
      .patch("/v1/onboarding/me")
      .set("Cookie", cookies)
      .set("x-csrf-token", csrfToken)
      .send({
        bio: "Updated bio",
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.message).toBe("Profile updated successfully");

    const getRes = await request(app)
      .get("/v1/onboarding/me")
      .set("Cookie", cookies);

    expect(getRes.status).toBe(200);

    expect(getRes.body.data.profile).toMatchObject({
      firstName: payload.firstName,
      lastName: payload.lastName,
      userName: payload.userName,
      bio: "Updated bio",
    });
  });
});
