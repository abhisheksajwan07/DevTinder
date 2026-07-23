import { eq, ilike, inArray, sql, InferSelectModel } from "drizzle-orm";

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
import { logger } from "../../config/logger.js";
import { handleDbError } from "../../errors/database-error.js";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class OnBoardingRepository implements IOnboardingRepository {
  async createProfile(userId: string, data: CreateProfileDTO): Promise<string> {
    try {
      return await db.transaction(async (tx) => {
        const profile = await this.createProfileRecord(tx, userId, data);

        const customSkillIds = await this.resolveCustomSkills(
          tx,
          data.customSkills,
        );
        const allSkillIds = [
          ...new Set([...(data.skillIds ?? []), ...customSkillIds]),
        ];

        await this.attachProfileSkills(tx, profile.id, allSkillIds);
        await this.attachProfileInterests(
          tx,
          profile.id,
          data.interestIds ?? [],
        );
        await this.attachProfileLookingFor(
          tx,
          profile.id,
          data.lookingForIds ?? [],
        );

        await tx
          .update(users)
          .set({ onBoardingComplete: true })
          .where(eq(users.id, userId));

        return profile.id;
      });
    } catch (error) {
      return handleDbError(error);
    }
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

    return this.loadProfileRelations(profile[0]);
  }

 

  async getMyProfileById(profileId: string): Promise<ProfileWithRelations> {
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1);

    if (!profile[0]) {
      throw new AppError("Profile not found", 404);
    }

    return this.loadProfileRelations(profile[0]);
  }

  async findProfileExists(profileId: string): Promise<boolean> {
    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.id, profileId));

    return !!profile;
  }

  async getProfileId(userId: string): Promise<string | null> {
    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, userId));

    return profile?.id ?? null;
  }

  async updateProfile(
    profileId: string,
    data: UpdateProfileDTO,
  ): Promise<void> {
    const {
      skillIds,
      customSkills,
      interestIds,
      lookingForIds,
      ...profileData
    } = data;

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(profiles)
          .set({
            ...profileData,
            embeddingStatus: "stale",
            embeddingVersion: sql`${profiles.embeddingVersion}+1`,
          })
          .where(eq(profiles.id, profileId));

        if (skillIds !== undefined || customSkills !== undefined) {
          const customSkillIds = await this.resolveCustomSkills(
            tx,
            customSkills ?? [],
          );
          const allSkillIds = [
            ...new Set([...(skillIds ?? []), ...customSkillIds]),
          ];
          await this.replaceProfileSkills(tx, profileId, allSkillIds);
        }

        if (interestIds !== undefined) {
          await this.replaceProfileInterests(tx, profileId, interestIds);
        }

        if (lookingForIds !== undefined) {
          await this.replaceProfileLookingFor(tx, profileId, lookingForIds);
        }
      });
    } catch (error) {
      return handleDbError(error);
    }
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

        db.select({ id: interests.id, name: interests.name }).from(interests),

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

  async isUsernameAvailable(username: string): Promise<boolean> {
    const existing = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userName, username))
      .limit(1);

    return existing.length === 0;
  }

  private async createProfileRecord(
    tx: Tx,
    userId: string,
    data: CreateProfileDTO,
  ) {
    logger.info({ userId, data }, "[createProfileRecord] Inserting profile");

    const [profile] = await tx
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

    if (!profile) {
      throw new Error("Failed to create profile record.");
    }

    return profile;
  }

  private async resolveCustomSkills(
    tx: Tx,
    customSkills: string[],
  ): Promise<string[]> {
    const trimmedNames = [
      ...new Set(customSkills.map((skill) => skill.trim())),
    ].filter(Boolean);

    if (trimmedNames.length === 0) {
      return [];
    }

    const existingSkills = await tx
      .select({
        id: skills.id,
        name: skills.name,
      })
      .from(skills)
      .where(
        inArray(
          sql`lower(${skills.name})`,
          trimmedNames.map((skill) => skill.toLowerCase()),
        ),
      );

    const existingNames = new Set(
      existingSkills.map((skill) => skill.name.toLowerCase()),
    );

    const newSkillNames = trimmedNames.filter(
      (skill) => !existingNames.has(skill.toLowerCase()),
    );

    let insertedSkills: { id: string }[] = [];

    if (newSkillNames.length > 0) {
      insertedSkills = await tx
        .insert(skills)
        .values(
          newSkillNames.map((name) => ({
            name,
            isCustom: true,
          })),
        )
        .returning({
          id: skills.id,
        });
    }

    return [
      ...existingSkills.map((skill) => skill.id),
      ...insertedSkills.map((skill) => skill.id),
    ];
  }

  private async attachProfileSkills(
    tx: Tx,
    profileId: string,
    skillIds: string[],
  ): Promise<void> {
    if (skillIds.length === 0) return;

    await tx.insert(profileSkills).values(
      skillIds.map((skillId) => ({
        profileId,
        skillId,
      })),
    );
  }

  private async replaceProfileSkills(
    tx: Tx,
    profileId: string,
    skillIds: string[],
  ): Promise<void> {
    await tx
      .delete(profileSkills)
      .where(eq(profileSkills.profileId, profileId));

    await this.attachProfileSkills(tx, profileId, skillIds);
  }

  private async attachProfileInterests(
    tx: Tx,
    profileId: string,
    interestIds: string[],
  ): Promise<void> {
    if (interestIds.length === 0) return;

    await tx.insert(profileInterests).values(
      interestIds.map((interestId) => ({
        profileId,
        interestId,
      })),
    );
  }

  private async replaceProfileInterests(
    tx: Tx,
    profileId: string,
    interestIds: string[],
  ): Promise<void> {
    await tx
      .delete(profileInterests)
      .where(eq(profileInterests.profileId, profileId));

    await this.attachProfileInterests(tx, profileId, interestIds);
  }

  private async attachProfileLookingFor(
    tx: Tx,
    profileId: string,
    lookingForIds: string[],
  ): Promise<void> {
    if (lookingForIds.length === 0) return;

    await tx.insert(profileLookingFor).values(
      lookingForIds.map((lookingForId) => ({
        profileId,
        lookingForId,
      })),
    );
  }

  private async replaceProfileLookingFor(
    tx: Tx,
    profileId: string,
    lookingForIds: string[],
  ): Promise<void> {
    await tx
      .delete(profileLookingFor)
      .where(eq(profileLookingFor.profileId, profileId));

    await this.attachProfileLookingFor(tx, profileId, lookingForIds);
  }

  private async loadProfileRelations(
    profile: InferSelectModel<typeof profiles>,
  ): Promise<ProfileWithRelations> {
    const profileId = profile.id;

    const [skillsRows, interestsRows, lookingForRows, avatarRows] =
      await Promise.all([
        db
          .select({
            id: skills.id,
            name: skills.name,
          })
          .from(profileSkills)
          .innerJoin(skills, eq(profileSkills.skillId, skills.id))
          .where(eq(profileSkills.profileId, profileId)),

        db
          .select({
            id: interests.id,
            name: interests.name,
          })
          .from(profileInterests)
          .innerJoin(interests, eq(profileInterests.interestId, interests.id))
          .where(eq(profileInterests.profileId, profileId)),

        db
          .select({
            id: lookingFor.id,
            name: lookingFor.name,
          })
          .from(profileLookingFor)
          .innerJoin(
            lookingFor,
            eq(profileLookingFor.lookingForId, lookingFor.id),
          )
          .where(eq(profileLookingFor.profileId, profileId)),

        db.select().from(avatars).where(eq(avatars.id, profile.avatarId)),
      ]);

    return {
      ...profile,
      skills: skillsRows,
      interests: interestsRows,
      lookingFor: lookingForRows,
      avatar: avatarRows[0] ?? null,
    };
  }
}
