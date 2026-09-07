import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

import { createTestApp } from "../../setup/testApp.js";
import {
  avatars,
  db,
  emailCredentials,
  profileActions,
  profiles,
  users,
} from "../../../db/drizzle.js";

vi.mock("../../../queues/email.queue.js", () => ({
  emailQueue: { add: vi.fn().mockResolvedValue(true) },
}));

vi.mock("../../../queues/embedding.queue.js", () => ({
  embeddingQueue: { add: vi.fn().mockResolvedValue(true) },
  createEmbeddingJobId: vi.fn((_profileId: string) => "test-job-id"),
}));

const app = createTestApp();
const VIEWER_EMAIL = "feed-viewer@test.com";
const PASSWORD = "password123!";
const VECTOR_SIZE = 1024;

const vector = (first: number, second = 0) =>
  Array.from({ length: VECTOR_SIZE }, (_, index) =>
    index === 0 ? first : index === 1 ? second : 0,
  );

async function getAvatarId() {
  const [existing] = await db.select({ id: avatars.id }).from(avatars).limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(avatars)
    .values({
      key: "feed_test_avatar",
      displayName: "Feed Test Avatar",
      gender: "neutral",
      style: "preset",
      imageUrl: null,
    })
    .returning({ id: avatars.id });

  return created!.id;
}

async function createProfile(
  email: string,
  userName: string,
  embedding: number[],
) {
  const avatarId = await getAvatarId();

  const [createdUser] = await db
    .insert(users)
    .values({ email, onBoardingComplete: true })
    .onConflictDoNothing()
    .returning({ id: users.id });

  const [user] = createdUser
    ? [createdUser]
    : await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email));

  const [profile] = await db
    .insert(profiles)
    .values({
      userId: user!.id,
      firstName: userName,
      lastName: "ttester",
      userName,
      bio: "feed integration test profile",
      avatarId,
      primaryRole: "backend",
      experienceLevel: "Mid",
      availability: "5_15_hours",
      embeddingStatus: "ready",
      embeddingVector: embedding,
    })
    .returning({ id: profiles.id });

  await db
    .update(users)
    .set({ onBoardingComplete: true })
    .where(eq(users.id, user!.id));

  return profile!.id;
}

async function createViewerSession() {
  await request(app).post("/v1/auth/signup").send({
    email: VIEWER_EMAIL,
    password: PASSWORD,
  });

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, VIEWER_EMAIL));

  await db
    .update(emailCredentials)
    .set({ isVerified: true })
    .where(eq(emailCredentials.userId, user!.id));

  const profileId = await createProfile(VIEWER_EMAIL, "feed_viewer", vector(1));

  const signin = await request(app)
    .post("/v1/auth/signin")
    .send({ email: VIEWER_EMAIL, password: PASSWORD });

  expect(signin.status).toBe(200);
  return {
    cookies: signin.headers["set-cookie"] as unknown as string[],
    profileId,
  };
}

async function cleanUp() {
  await db.delete(users).where(eq(users.email, VIEWER_EMAIL));
  for (const email of [
    "feed-candidate-a@test.com",
    "feed-candidate-b@test.com",
  ]) {
    await db.delete(users).where(eq(users.email, email));
  }
}

describe("Feed integration tests", () => {
  beforeEach(cleanUp);
  afterEach(cleanUp);

  it("returns a valid feed for a completed authenticated user", async () => {
    const { cookies } = await createViewerSession();
    await createProfile(
      "feed-candidate-a@test.com",
      "feed_candidate_a",
      vector(1),
    );

    const res = await request(app).get("/v1/feed").set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.profiles).toHaveLength(1);
    expect(res.body.data.profiles[0]).toMatchObject({
      username: "feed_candidate_a",
      firstName: "feed_candidate_a",
      primaryRole: "backend",
      matchScore: 100,
    });
  });

  it("excludes a profile with an existing action", async () => {
    const { cookies, profileId: viewerProfileId } = await createViewerSession();
    const actedProfileId = await createProfile(
      "feed-candidate-a@test.com",
      "feed_candidate_a",
      vector(1),
    );
    await createProfile(
      "feed-candidate-b@test.com",
      "feed_candidate_b",
      vector(1),
    );

    await db.insert(profileActions).values({
      actorProfileId: viewerProfileId,
      targetProfileId: actedProfileId,
      action: "skipped",
      status: null,
    });

    const res = await request(app).get("/v1/feed").set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(
      res.body.data.profiles.map(
        (profile: { username: string }) => profile.username,
      ),
    ).toEqual(["feed_candidate_b"]);

    // already excluded
    expect(
      res.body.data.profiles.map(
        (profile: { username: string }) => profile.username,
      ),
    ).not.toEqual(["feed_candidate_a"]);
  });
});
