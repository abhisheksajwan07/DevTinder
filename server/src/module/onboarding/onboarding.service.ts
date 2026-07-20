import { embeddingQueue } from "../../queues/embedding.queue.js";
import {
  IOnboardingRepository,
  IOnboardingService,
  OnboardingOptions,
} from "./onboarding.types.js";
import { CreateProfileDTO, UpdateProfileDTO } from "./onboarding.validator.js";

export class OnboardingService implements IOnboardingService {
  constructor(private repository: IOnboardingRepository) {}

  async createProfile(userId: string, data: CreateProfileDTO): Promise<void> {
    const profileId = await this.repository.createProfile(userId, data);
    await embeddingQueue.add(
      "generate_embedding",
      { profileId },
      { jobId: `${profileId}-${Date.now()}` },
    );
  }

  async getMyProfile(userId: string) {
    return await this.repository.getMyProfile(userId);
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<void> {
    const profile = await this.repository.getMyProfile(userId);
    await this.repository.updateProfile(profile.id, data);
    await embeddingQueue.add(
      "generate_embedding",
      { profileId: profile.id },
      { jobId: `${profile.id}-${Date.now()}` },
    );
  }
  async getOptions(): Promise<OnboardingOptions> {
    return await this.repository.getOptions();
  }
  async checkUserName(username: string): Promise<boolean> {
    return await this.repository.isUsernameAvailable(username);
  }
}
