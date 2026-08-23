import { z } from "zod";
import {
  primaryRoleEnum,
  experienceLevelEnum,
  weeklyAvailabilityEnum,
} from "../../db/drizzle.js";

export const createProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  userName: z
    .string()
    .min(3)
    .max(30)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  bio: z.string().max(500).optional(),
  primaryRole: z.enum(primaryRoleEnum.enumValues),
  experienceLevel: z.enum(experienceLevelEnum.enumValues),
  availability: z.enum(weeklyAvailabilityEnum.enumValues),
  avatarId: z.uuid(),

  projectDescription: z.string().max(1000).optional(),
  skillIds: z.array(z.uuid()).max(10).default([]),
  customSkills: z.array(z.string().min(1).max(50)).max(5).default([]),

  interestIds: z.array(z.uuid()).min(1).max(10),
  lookingForIds: z.array(z.uuid()).min(1).max(5),
});

export const updateProfileSchema = createProfileSchema
  .omit({
    skillIds: true,
    customSkills: true,
    interestIds: true,
    lookingForIds: true,
  })
  .partial()
  .extend({
    skillIds: z.array(z.uuid()).max(10).optional(),
    customSkills: z.array(z.string().min(1).max(50)).max(5).optional(),
    interestIds: z.array(z.uuid()).min(1).max(10).optional(),
    lookingForIds: z.array(z.uuid()).min(1).max(5).optional(),
  });

export const checkUsernameSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
});

export type CreateProfileDTO = z.infer<typeof createProfileSchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
