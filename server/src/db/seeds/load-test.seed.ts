import { eq } from "drizzle-orm";
import { db, pool, users } from "../drizzle.js";
import { emailCredentials } from "../schema/auth.schema.js";
import { hashPassword } from "../../utils/password.js";
import { logger } from "../../config/logger.js";

/**
 * seed script for k6
 *  Email: loadtest_1@devtinder.local ...     loadtest_50@devtinder.local
 *   Password: Password@123
 */
export const seedLoadTestUsers = async (count = 50) => {
  logger.info(`Seeding ${count} load-test users...`);


  const passwordHash = await hashPassword("Password@123");

  for (let i = 1; i <= count; i++) {
    const email = `loadtest_${i}@devtinder.local`;

 
    await db
      .insert(users)
      .values({
        email,
        onBoardingComplete: false,
      })
      .onConflictDoNothing();


    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (!user) continue;

   
    await db
      .insert(emailCredentials)
      .values({
        userId: user.id,
        passwordHash,
        isVerified: true,
        loginAttempts: 0,
      })
      .onConflictDoNothing();
  }

  logger.info(` Successfully seeded ${count} load-test users!`);
};


const run = async () => {
  try {
    // await seedLoadTestUsers(50);
    await seedLoadTestUsers(200)
    await pool.end();
    process.exit(0);
  } catch (error) {
    logger.error(error, "Load test seeding failed:");
    await pool.end();
    process.exit(1);
  }
};

run();
