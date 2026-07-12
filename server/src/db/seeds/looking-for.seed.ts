import { db, lookingFor } from "../drizzle.js";

export const seedLookingFor = async () => {
  await db.insert(lookingFor).values([
    { name: "Co-founder" },
    { name: "Collaborator" },
    { name: "Mentor" },
    { name: "Mentee" },
    { name: "Freelance Partner" },
    { name: "Open Source Contributor" },
  ]).onConflictDoNothing();
};