import { asc, eq, like } from "drizzle-orm";
import { db, profileActions, profiles, users } from "../../drizzle.js";
import { logger } from "../../../config/logger.js";

const FORWARD_ACTIONS_PER_USER = 150;
const REVERSE_ACTIONS_PER_USER = 50;
const BATCH_SIZE = 1000;

const getProfilesByEmailPattern = (emailPattern: string) =>
  db
    .select({ id: profiles.id })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(like(users.email, emailPattern))
    .orderBy(asc(users.email));

export const seedProfileActions = async () => {
  const [loadTestProfiles, candidateProfiles] = await Promise.all([
    getProfilesByEmailPattern("loadtest_%@devtinder.local"),
    getProfilesByEmailPattern("feedcandidate_%@devtinder.local"),
  ]);

  if (loadTestProfiles.length === 0 || candidateProfiles.length === 0) {
    throw new Error(
      "Seed load-test users and feed candidates before profile actions.",
    );
  }

  const actions: Array<{
    actorProfileId: string;
    targetProfileId: string;
    action: "skipped" | "interested";
    status: "pending" | null;
  }> = [];

  for (let i = 0; i < loadTestProfiles.length; i++) {
    const user = loadTestProfiles[i]!;

    // 150 forward actions: test user -> candidate
    for (let offset = 0; offset < FORWARD_ACTIONS_PER_USER; offset++) {
      const targetIndex =
        (i * FORWARD_ACTIONS_PER_USER + offset) % candidateProfiles.length;
      actions.push({
        actorProfileId: user.id,
        targetProfileId: candidateProfiles[targetIndex]!.id,
        action: offset % 3 === 0 ? "interested" : "skipped",
        status: offset % 10 === 0 ? "pending" : null,
      });
    }

    // 50 reverse actions: candidate -> test user
    for (let offset = 0; offset < REVERSE_ACTIONS_PER_USER; offset++) {
      const actorIndex =
        (i * REVERSE_ACTIONS_PER_USER + offset) % candidateProfiles.length;
      actions.push({
        actorProfileId: candidateProfiles[actorIndex]!.id,
        targetProfileId: user.id,
        action: offset % 4 === 0 ? "interested" : "skipped",
        status: offset % 10 === 0 ? "pending" : null,
      });
    }
  }

  for (let i = 0; i < actions.length; i += BATCH_SIZE) {
    await db
      .insert(profileActions)
      .values(actions.slice(i, i + BATCH_SIZE))
      .onConflictDoNothing();
  }

  logger.info(
    `Successfully seeded ${actions.length} deterministic profile actions.`,
  );
};
