import {
  FeedQuery,
  FeedResult,
  IFeedRepository,
  IFeedService,
} from "./feed.types.js";
import { repository as onboardingRepository } from "../onboarding/onboarding.dependencies.js";
import { AppError } from "../../utils/AppError.js";
export class FeedService implements IFeedService {
  constructor(private readonly repository: IFeedRepository) {}

  async getFeed(userId: string, query: FeedQuery): Promise<FeedResult> {
    const viewerProfile = await onboardingRepository.getMyProfile(userId);

    if (
      viewerProfile.embeddingStatus !== "ready" ||
      !viewerProfile.embeddingVector
    ) {
      throw new AppError(
        "Your recommendations are being prepared. Please try again shortly.",
        503,
        "FEED_NOT_READY",
      );
    }
    const profiles = await this.repository.getFeed(
      viewerProfile.id,
      viewerProfile.embeddingVector,
      query.limit,
    );

    return { profiles };
  }
}
