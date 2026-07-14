import {
  IOnboardingRepository,
  IOnboardingService,
  OnboardingOptions,
} from "./onboarding.types.js";
import { CreateProfileDTO, UpdateProfileDTO } from "./onboarding.validator.js";

export class OnboardingService implements IOnboardingService {
  constructor(private repository: IOnboardingRepository) {}

  async createProfile(userId: string, data: CreateProfileDTO): Promise<void> {
    await this.repository.createProfile(userId, data);
  }

  async getMyProfile(userId: string) {
    return await this.repository.getMyProfile(userId);
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<void> {
    const profile = await this.repository.getMyProfile(userId);
    await this.repository.updateProfile(profile.id, data);
  }
  async getOptions(): Promise<OnboardingOptions> {
    return await this.repository.getOptions();
  }
  async checkUserName(username: string): Promise<boolean> {
    return await this.repository.checkUserName(username);
  }
}
