import { seedSkills } from "./skills.seed.js";
import { seedInterests } from "./interests.seed.js";
import { seedLookingFor } from "./looking-for.seed.js";
import { seedAvatars } from "./avatars.seed.js";
import { pool } from "../drizzle.js";
import { logger } from "../../config/logger.js";

const seed = async () => {
  logger.info("Seeding started...");

  await seedAvatars();
  logger.info("Avatars seeded");

  await seedSkills();
  logger.info("Skills seeded");

  await seedInterests();
  logger.info("Interests seeded");

  await seedLookingFor();
  logger.info("LookingFor seeded");

  logger.info("Seeding complete.");

  await pool.end();
  process.exit(0);
};

seed().catch((err) => {
  logger.error(err, "Seeding failed:");
  process.exit(1);
});