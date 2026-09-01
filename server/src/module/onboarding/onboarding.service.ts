import {
  createEmbeddingJobId,
  embeddingQueue,
} from "../../queues/embedding.queue.js";
import { githubSyncQueue } from "../../queues/github-sync.queue.js";
import {
  IOnboardingRepository,
  IOnboardingService,
  OnboardingOptions,
} from "./onboarding.types.js";
import { CreateProfileDTO, UpdateProfileDTO } from "./onboarding.validator.js";

export class OnboardingService implements IOnboardingService {
  constructor(private repository: IOnboardingRepository) { }

  async createProfile(userId: string, data: CreateProfileDTO): Promise<void> {

    const profileId = await this.repository.createProfile(userId, data);

    if (await this.repository.hasGitHubAuthAccount(userId)) {
      await githubSyncQueue.add(
        "github_sync",
        { profileId },
        { jobId: `github-sync-${profileId}` },
      );
    } else {
      await embeddingQueue.add(
        "generate_embedding",
        { profileId },
        { jobId: createEmbeddingJobId(profileId) },
      );
    }
  }

  async getMyProfile(userId: string) {
    return await this.repository.getMyProfile(userId);
  }

  async getProfileByUsername(username: string) {
    return await this.repository.getProfileByUsername(username);
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<void> {
    const profile = await this.repository.getMyProfile(userId);
    await this.repository.updateProfile(profile.id, data);
    // use a timestamp suff so every profile edit enqueues a fresh job.
    // a static jobId would cause BullMQ to silently deduplicate all updates
    // after the first one — the job would never run again.
    await embeddingQueue.add(
      "generate_embedding",
      { profileId: profile.id },
      { jobId: createEmbeddingJobId(profile.id) },
    );
  }

  async getOptions(): Promise<OnboardingOptions> {
    return await this.repository.getOptions();
  }

  async checkUserName(username: string): Promise<boolean> {
    return await this.repository.isUsernameAvailable(username);
  }
}
