import { db, avatars } from "../drizzle.js";

const avatarSeeds = [
  {
    key: "developer_blue",
    displayName: "Classic",
    imageUrl: "https://api.dicebear.com/10.x/micah/svg?seed=209nnwp2",
  },
  {
    key: "developer_green",
    displayName: "Cool",
    imageUrl: "https://api.dicebear.com/10.x/micah/svg?seed=f1y7llf6",
  },
  {
    key: "robot_orange",
    displayName: "Bold",
    imageUrl: "https://api.dicebear.com/10.x/micah/svg?seed=6184grt1",
  },
  {
    key: "fox_purple",
    displayName: "Sunny",
    imageUrl: "https://api.dicebear.com/10.x/micah/svg?seed=d5tdsvz2",
  },
  {
    key: "astronaut_red",
    displayName: "Calm",
    imageUrl: "https://api.dicebear.com/10.x/micah/svg?seed=gb64d0cb",
  },
  {
    key: "thoughtful",
    displayName: "Thoughtful",
    imageUrl: "https://api.dicebear.com/10.x/micah/svg?seed=f6",
  },
];

export const seedAvatars = async () => {
  for (const avatar of avatarSeeds) {
    await db
      .insert(avatars)
      .values({
        ...avatar,
        gender: "neutral",
        style: "preset",
      })
      .onConflictDoUpdate({
        target: avatars.key,
        set: {
          displayName: avatar.displayName,
          imageUrl: avatar.imageUrl,
          gender: "neutral",
          style: "preset",
        },
      });
  }
};
