import { CreateProfileDTO, UpdateProfileDTO } from "./onboarding.validator.js";
import { InferSelectModel } from "drizzle-orm";
import {
  profiles,
  skills,
  interests,
  lookingFor,
  avatars,
} from "../../db/drizzle.js";

export type ProfileWithRelations = InferSelectModel<typeof profiles> & {
  skills: Pick<InferSelectModel<typeof skills>, "id" | "name">[];
  interests: Pick<InferSelectModel<typeof interests>, "id" | "name">[];
  lookingFor: Pick<InferSelectModel<typeof lookingFor>, "id" | "name">[];
  avatar: InferSelectModel<typeof avatars> | null;
};
export interface IOnboardingRepository {
  createProfile(userId: string, data: CreateProfileDTO): Promise<string>;

  getMyProfile(userId: string): Promise<ProfileWithRelations>;

  updateProfile(profileId: string, data: UpdateProfileDTO): Promise<void>;

  getOptions(): Promise<OnboardingOptions>;
  isUsernameAvailable(username: string): Promise<boolean>;
  getMyProfileById(profileId: string): Promise<ProfileWithRelations>;
}

export interface IOnboardingService {
  createProfile(userId: string, data: CreateProfileDTO): Promise<void>;
  getMyProfile(userId: string): Promise<ProfileWithRelations>;
  updateProfile(userId: string, data: UpdateProfileDTO): Promise<void>;
  getOptions(): Promise<OnboardingOptions>;
  checkUserName(username: string): Promise<boolean>;
}

export interface OnboardingOptions {
  skills: { id: string; name: string; category: string }[];
  interests: { id: string; name: string }[];
  lookingFor: { id: string; name: string }[];
  avatars: {
    id: string;

    displayName: string;

    imageUrl: string | null;
  }[];
}
