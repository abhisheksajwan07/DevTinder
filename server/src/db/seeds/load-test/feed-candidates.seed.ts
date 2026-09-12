import { db, profiles, users } from "../../drizzle.js";
import { logger } from "../../../config/logger.js";
import {
  attachProfileRelations,
  availabilities,
  generateSyntheticVector,
  getSeedReferences,
  levels,
  roles,
} from "./load-test-users.seed.js";

export const seedFeedCandidates = async (count = 5000) => {
  logger.info(`Seeding ${count} feed candidates...`);
  const refs = await getSeedReferences(true);

  const insertedUsers = await db
    .insert(users)
    .values(
      Array.from({ length: count }, (_, i) => ({
        email: `feedcandidate_${i + 1}@devtinder.local`,
        onBoardingComplete: true,
      })),
    )
    .onConflictDoUpdate({
      target: users.email,
      set: { onBoardingComplete: true },
    })
    .returning({ id: users.id });

  const insertedProfiles = await db
    .insert(profiles)
    .values(
      insertedUsers.map((user, idx) => {
        const i = idx + 1;
        return {
          userId: user.id,
          firstName: "Feed",
          lastName: `Candidate${i}`,
          userName: `Feed_candidate_${i}`,
          bio: `Developer profile ${i} generated for feed performance testing.`,
          avatarId:
            refs.existingAvatars[idx % refs.existingAvatars.length]?.id ??
            refs.defaultAvatarId,
          primaryRole: roles[i % roles.length]!,
          experienceLevel: levels[i % levels.length]!,
          availability: availabilities[i % availabilities.length]!,
          projectDescription: `Synthetic feed candidate ${i}`,
          embeddingStatus: "ready" as const,
          embeddingVector: generateSyntheticVector(i),
        };
      }),
    )
    .onConflictDoNothing()
    .returning({ id: profiles.id });

  await attachProfileRelations(insertedProfiles, refs);

  logger.info(
    `Successfully seeded ${insertedProfiles.length} feed candidates with profiles & embeddings.`,
  );
};
