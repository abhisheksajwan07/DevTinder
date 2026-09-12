import { inArray, like, or } from "drizzle-orm";
import {
  db,
  emailCredentials,
  pool,
  profileActions,
  profiles,
  users,
} from "../../drizzle.js";

const run = async () => {
  const seedUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(
      or(
        like(users.email, "loadtest_%"),
        like(users.email, "feedcandidate_%"),
      ),
    );

  const userIds = seedUsers.map((u) => u.id);
  if (userIds.length === 0) {
    console.log("No load-test users found.");
    return;
  }

  const seedProfiles = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(inArray(profiles.userId, userIds));
  const profileIds = seedProfiles.map((p) => p.id);

  if (profileIds.length > 0) {
    await db
      .delete(profileActions)
      .where(
        or(
          inArray(profileActions.actorProfileId, profileIds),
          inArray(profileActions.targetProfileId, profileIds),
        ),
      );
  }

  await db.delete(emailCredentials).where(inArray(emailCredentials.userId, userIds));
  await db.delete(users).where(inArray(users.id, userIds));

  console.log(`Removed ${userIds.length} load-test users and their related data.`);
};

try {
  await run();
} catch (error) {
  console.error("Load-test cleanup failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
