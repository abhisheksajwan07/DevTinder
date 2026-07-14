import { db, avatars } from "../drizzle.js";

export const seedAvatars = async () => {
  await db.insert(avatars).values([
    { key: "developer_blue", displayName: "Blue Developer", gender: "neutral", style: "preset" },
    { key: "developer_green", displayName: "Green Developer", gender: "neutral", style: "preset" },
    { key: "robot_orange", displayName: "Orange Robot", gender: "neutral", style: "preset" },
    { key: "fox_purple", displayName: "Purple Fox", gender: "neutral", style: "preset" },
    { key: "astronaut_red", displayName: "Red Astronaut", gender: "neutral", style: "preset" },
  ]).onConflictDoNothing();
};