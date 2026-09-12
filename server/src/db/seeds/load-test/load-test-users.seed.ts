import { eq } from "drizzle-orm";
import {
  avatars,
  db,
  emailCredentials,
  interests,
  lookingFor,
  profileInterests,
  profileLookingFor,
  profileSkills,
  profiles,
  skills,
  users,
} from "../../drizzle.js";
import { hashPassword } from "../../../utils/password.js";
import { logger } from "../../../config/logger.js";

export const LOAD_TEST_PASSWORD = "Password@123";

export const roles = [
  "backend",
  "frontend",
  "fullstack",
  "mobile",
  "devops",
  "designer",
] as const;

export const levels = ["Junior", "Mid", "Senior", "Lead"] as const;

export const availabilities = [
  "1_5_hours",
  "5_15_hours",
  "15_30_hours",
  "full_time",
] as const;

export function generateSyntheticVector(seed: number): number[] {
  const vector = Array.from({ length: 1024 }, (_, index) =>
    Math.sin(seed * 0.5 + index * 0.01),
  );
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return vector.map((value) => Number((value / norm).toFixed(6)));
}

export type SeedReferences = {
  existingAvatars: Array<{ id: string }>;
  existingSkills: Array<{ id: string }>;
  existingInterests: Array<{ id: string }>;
  existingLookingFor: Array<{ id: string }>;
  defaultAvatarId: string;
};

export async function getSeedReferences(requireRelations = false): Promise<SeedReferences> {
  const [
    existingAvatars,
    existingSkills,
    existingInterests,
    existingLookingFor,
  ] = await Promise.all([
    db.select().from(avatars),
    db.select({ id: skills.id }).from(skills),
    db.select({ id: interests.id }).from(interests),
    db.select({ id: lookingFor.id }).from(lookingFor),
  ]);

  if (
    requireRelations &&
    (!existingSkills.length || !existingInterests.length || !existingLookingFor.length)
  ) {
    throw new Error("Seed skills, interests, and lookingFor before seeding feed candidates.");
  }

  let defaultAvatarId = existingAvatars[0]?.id;
  if (!defaultAvatarId) {
    const [created] = await db
      .insert(avatars)
      .values({
        key: "loadtest_default_avatar",
        displayName: "Load Test Avatar",
        gender: "neutral",
        style: "preset",
        imageUrl: null,
      })
      .onConflictDoNothing()
      .returning({ id: avatars.id });

    defaultAvatarId =
      created?.id ??
      (
        await db
          .select({ id: avatars.id })
          .from(avatars)
          .where(eq(avatars.key, "loadtest_default_avatar"))
          .limit(1)
      )[0]?.id;
  }

  return {
    existingAvatars,
    existingSkills,
    existingInterests,
    existingLookingFor,
    defaultAvatarId: defaultAvatarId!,
  };
}

export async function attachProfileRelations(
  profilesList: Array<{ id: string }>,
  refs: SeedReferences,
) {
  const { existingSkills, existingInterests, existingLookingFor } = refs;

  const skillRows = profilesList.flatMap((profile, idx) => {
    const i = idx + 1;
    return [
      existingSkills[i % existingSkills.length]?.id,
      existingSkills[(i * 2) % existingSkills.length]?.id,
    ]
      .filter((id): id is string => Boolean(id))
      .map((skillId) => ({ profileId: profile.id, skillId }));
  });

  const interestRows = profilesList.flatMap((profile, idx) => {
    const i = idx + 1;
    return [
      existingInterests[i % existingInterests.length]?.id,
      existingInterests[(i * 2) % existingInterests.length]?.id,
    ]
      .filter((id): id is string => Boolean(id))
      .map((interestId) => ({ profileId: profile.id, interestId }));
  });

  const lookingForRows = profilesList
    .map((profile, idx) => {
      const target = existingLookingFor[idx % existingLookingFor.length];
      return target?.id ? { profileId: profile.id, lookingForId: target.id } : null;
    })
    .filter((row): row is { profileId: string; lookingForId: string } => Boolean(row));

  if (skillRows.length > 0) {
    await db.insert(profileSkills).values(skillRows).onConflictDoNothing();
  }
  if (interestRows.length > 0) {
    await db.insert(profileInterests).values(interestRows).onConflictDoNothing();
  }
  if (lookingForRows.length > 0) {
    await db.insert(profileLookingFor).values(lookingForRows).onConflictDoNothing();
  }
}

export const seedLoadTestUsers = async (count = 50) => {
  logger.info(`Seeding ${count} fully-onboarded load-test users...`);
  const refs = await getSeedReferences(false);
  const passwordHash = await hashPassword(LOAD_TEST_PASSWORD);

  const insertedUsers = await db
    .insert(users)
    .values(
      Array.from({ length: count }, (_, i) => ({
        email: `loadtest_${i + 1}@devtinder.local`,
        onBoardingComplete: true,
      })),
    )
    .onConflictDoUpdate({
      target: users.email,
      set: { onBoardingComplete: true },
    })
    .returning({ id: users.id, email: users.email });

  await db
    .insert(emailCredentials)
    .values(
      insertedUsers.map((user) => ({
        userId: user.id,
        passwordHash,
        isVerified: true,
        loginAttempts: 0,
      })),
    )
    .onConflictDoNothing();

  const insertedProfiles = await db
    .insert(profiles)
    .values(
      insertedUsers.map((user, idx) => {
        const i = idx + 1;
        return {
          userId: user.id,
          firstName: "LoadTest",
          lastName: `User${i}`,
          userName: `Loadtest_user_${i}`,
          bio: `Fullstack developer #${i} generated for automated performance testing.`,
          avatarId:
            refs.existingAvatars[idx % refs.existingAvatars.length]?.id ??
            refs.defaultAvatarId,
          primaryRole: roles[i % roles.length]!,
          experienceLevel: levels[i % levels.length]!,
          availability: availabilities[i % availabilities.length]!,
          projectDescription: `Performance benchmark test profile for VU ${i}`,
          embeddingStatus: "ready" as const,
          embeddingVector: generateSyntheticVector(i),
        };
      }),
    )
    .onConflictDoNothing()
    .returning({ id: profiles.id });

  await attachProfileRelations(insertedProfiles, refs);

  logger.info(
    ` Successfully seeded ${count} load-test users with complete profiles & embeddings!`,
  );
};
