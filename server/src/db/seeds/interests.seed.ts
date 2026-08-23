
import { interests,db } from "../drizzle.js";

export const seedInterests = async () => {
  await db
    .insert(interests)
    .values([
      { name: "AI & Machine Learning" },
      { name: "Open Source" },
      { name: "Startups" },
      { name: "Web3 & Blockchain" },
      { name: "Developer Tools" },
      { name: "SaaS" },
      { name: "Mobile Apps" },
      { name: "Game Development" },
      { name: "Cybersecurity" },
      { name: "Cloud Computing" },
      { name: "DevOps" },
      { name: "UI/UX Design" },
      { name: "Data Engineering" },
      { name: "Fintech" },
      { name: "EdTech" },
    ])
    .onConflictDoNothing();
};
