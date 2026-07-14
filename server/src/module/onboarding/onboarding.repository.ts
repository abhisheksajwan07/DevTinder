import { eq, ilike } from "drizzle-orm";

import {
  db,
  profiles,
  skills,
  profileSkills,
  profileInterests,
  profileLookingFor,
  users,
  interests,
  lookingFor,
  avatars,
} from "../../db/drizzle.js";
import { CreateProfileDTO, UpdateProfileDTO } from "./onboarding.validator.js";
import {
  IOnboardingRepository,
  OnboardingOptions,
  ProfileWithRelations,
} from "./onboarding.types.js";
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

      for (const rawSkillName of data.customSkills) {
        const skillName = rawSkillName.trim();
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

  async getMyProfile(userId: string): Promise<ProfileWithRelations> {
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!profile[0]) {
      throw new AppError("Profile not found", 404);
    }
    const profileId = profile[0].id;

    const [skillsRows, interestsRows, lookingForRows, avatar] =
      await Promise.all([
        db
          .select({ id: skills.id, name: skills.name })
          .from(profileSkills)
          .innerJoin(skills, eq(profileSkills.skillId, skills.id))
          .where(eq(profileSkills.profileId, profileId)),

        db
          .select({ id: interests.id, name: interests.name })
          .from(profileInterests)
          .innerJoin(interests, eq(profileInterests.interestId, interests.id))
          .where(eq(profileInterests.profileId, profileId)),

        db
          .select({ id: lookingFor.id, name: lookingFor.name })
          .from(profileLookingFor)
          .innerJoin(
            lookingFor,
            eq(profileLookingFor.lookingForId, lookingFor.id),
          )
          .where(eq(profileLookingFor.profileId, profileId)),

        db.select().from(avatars).where(eq(avatars.id, profile[0].avatarId)),
      ]);

    return {
      ...profile[0],
      skills: skillsRows,
      interests: interestsRows,
      lookingFor: lookingForRows,
      avatar: avatar[0] ?? null,
    };
  }

  async updateProfile(
    profileId: string,
    data: UpdateProfileDTO,
  ): Promise<void> {
    await db.transaction(async (tx) => {
      const {
        skillIds,
        customSkills,
        interestIds,
        lookingForIds,
        ...profileData
      } = data;
      await tx
        .update(profiles)
        .set({ ...profileData, embeddingStatus: "stale" })
        .where(eq(profiles.id, profileId));

      if (skillIds !== undefined || customSkills !== undefined) {
        await tx
          .delete(profileSkills)
          .where(eq(profileSkills.profileId, profileId));
        const customSkillIds: string[] = [];

        for (const rawSkillName of customSkills ?? []) {
          const skillName = rawSkillName.trim();
          const existing = await tx
            .select({ id: skills.id })
            .from(skills)
            .where(ilike(skills.name, skillName))
            .limit(1);
          if (existing.length > 0) {
            const id = existing[0]?.id;
            if (id) customSkillIds.push(id);
          } else {
            const [newSkill] = await tx
              .insert(skills)
              .values({
                name: skillName,
                isCustom: true,
              })
              .returning({ id: skills.id });

            if (newSkill?.id) customSkillIds.push(newSkill.id);
          }
        }

        const allSkillsId = [
          ...new Set([...(skillIds ?? []), ...customSkillIds]),
        ];

        if (allSkillsId.length > 0) {
          await tx.insert(profileSkills).values(
            allSkillsId.map((skillId) => ({
              profileId,
              skillId,
            })),
          );
        }
      }

      if (interestIds !== undefined) {
        await tx
          .delete(profileInterests)
          .where(eq(profileInterests.profileId, profileId));

        if (interestIds.length > 0) {
          await tx.insert(profileInterests).values(
            interestIds.map((interestId) => ({
              profileId,
              interestId,
            })),
          );
        }
      }

      if (lookingForIds !== undefined) {
        await tx
          .delete(profileLookingFor)
          .where(eq(profileLookingFor.profileId, profileId));

        if (lookingForIds.length > 0) {
          await tx.insert(profileLookingFor).values(
            lookingForIds.map((lookingForId) => ({
              profileId,
              lookingForId,
            })),
          );
        }
      }
    });
  }

  async getOptions(): Promise<OnboardingOptions> {
    const [skillsRows, interestsRows, lookingForRows, avatarsRows] =
      await Promise.all([
        db
          .select({
            id: skills.id,
            name: skills.name,
            category: skills.category,
          })
          .from(skills)
          .where(eq(skills.isCustom, false)),

        db
          .select({
            id: interests.id,
            name: interests.name,
          })
          .from(interests),
        db
          .select({ id: lookingFor.id, name: lookingFor.name })
          .from(lookingFor),

        db
          .select({
            id: avatars.id,
            displayName: avatars.displayName,
            imageUrl: avatars.imageUrl,
          })
          .from(avatars),
      ]);
    return {
      skills: skillsRows,
      interests: interestsRows,
      lookingFor: lookingForRows,
      avatars: avatarsRows,
    };
  }

  async checkUserName(username: string): Promise<boolean> {
    const existing = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userName, username))
      .limit(1);

    return existing.length === 0;
  }
}
