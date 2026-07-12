import { CreateProfileDTO } from "./onboarding.validator.js";

export interface IOnboardingRepository {
  createProfile(userId: string, data: CreateProfileDTO): Promise<void>;
}

export interface IOnboardingService {
  createProfile(userId: string, data: CreateProfileDTO): Promise<void>;
}
