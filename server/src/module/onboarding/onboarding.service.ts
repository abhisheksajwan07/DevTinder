import {
  IOnboardingRepository,
  IOnboardingService,
} from "./onboarding.types.js";
import { CreateProfileDTO } from "./onboarding.validator.js";

export class OnboardingService implements IOnboardingService {
  constructor(private repository: IOnboardingRepository) {}

  async createProfile(userId: string, data: CreateProfileDTO): Promise<void> {
    await this.repository.createProfile(userId, data);
  }

  async getMyProfile(userId: string) {
    return await this.repository.getMyProfile(userId);
  }
}
