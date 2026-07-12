import { eq, ilike } from "drizzle-orm";

import {
  db,
  profiles,
  skills,
  profileSkills,
  profileInterests,
  profileLookingFor,
  users,
} from "../../db/drizzle.js";
import { CreateProfileDTO } from "./onboarding.validator.js";
import { IOnboardingRepository } from "./onboarding.types.js";
import { AppError } from "../../utils/AppError.js";

export class OnBoardingRepository implements IOnboardingRepository {
  async createProfile(userId: string, data: CreateProfileDTO): Promise<void> {
    await db.transaction(async (tx) => {
      let profile;
      try {
        const [inserted] = await tx
          .insert(profiles)
          .values({
            userId,

            firstName: data.firstName,
            lastName: data.lastName,
            userName: data.userName,
            bio: data.bio,
            avatarId: data.avatarId,
            primaryRole: data.primaryRole,
            experienceLevel: data.experienceLevel,
            availability: data.availability,
            githubUsername: data.githubUsername,
            projectDescription: data.projectDescription,
          })
          .returning({ id: profiles.id });
        profile = inserted;
      } catch (error: any) {
        if (error?.code === "23505") {
          throw new AppError("Username already taken.", 409, "USERNAME_TAKEN");
        }
        throw error;
      }

      if (!profile) {
        throw new Error("Failed to create profile record.");
      }
      const profileId = profile?.id;

      const customSkillsIds: string[] = [];

      for (const skillName of data.customSkills) {
        const existing = await tx
          .select({ id: skills.id })
          .from(skills)
          .where(ilike(skills.name, skillName))
          .limit(1);

        if (existing.length > 0) {
          const id = existing[0]?.id;
          if (id) customSkillsIds.push(id);
        } else {
          const [newSkill] = await tx
            .insert(skills)
            .values({
              name: skillName,
              isCustom: true,
            })
            .returning({ id: skills.id });
          const newSkillId = newSkill?.id;
          if (newSkillId) customSkillsIds.push(newSkillId);
        }
      }

      const allSkillsId = [...new Set([...data.skillIds, ...customSkillsIds])];

      if (allSkillsId.length > 0) {
        await tx
          .insert(profileSkills)
          .values(allSkillsId.map((skillId) => ({ profileId, skillId })));
      }

      if (data.interestIds.length > 0) {
        await tx.insert(profileInterests).values(
          data.interestIds.map((interestId) => ({
            profileId,
            interestId,
          })),
        );
      }

      if (data.lookingForIds.length > 0) {
        await tx.insert(profileLookingFor).values(
          data.lookingForIds.map((lookingForId) => ({
            profileId,
            lookingForId,
          })),
        );
      }

      await tx
        .update(users)
        .set({ onBoardingComplete: true })
        .where(eq(users.id, userId));
    });
  }
}
