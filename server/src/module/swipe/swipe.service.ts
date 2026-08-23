import { AppError } from "../../utils/AppError.js";
import { ISwipeRepository, ISwipeService } from "./swipe.types.js";
import { IOnboardingRepository } from "../onboarding/onboarding.types.js";
import { matchingQueue } from "../../queues/matching.queue.js";

export class SwipeService implements ISwipeService {
  constructor(
    private readonly swipeRepository: ISwipeRepository,
    private readonly onboardingRepository: IOnboardingRepository,
  ) {}

  getIncomingRequests(profileId: string) {
    return this.swipeRepository.getIncomingRequests(profileId);
  }

  async skip(actorProfileId: string, targetProfileId: string) {
    await this.ensureCanSwipe(actorProfileId, targetProfileId);

    await this.swipeRepository.insertAction({
      actorProfileId,
      targetProfileId,
      action: "skipped",
      status: null,
    });
  }

  async connect(actorProfileId: string, targetProfileId: string) {
    await this.ensureCanSwipe(actorProfileId, targetProfileId);
    await this.swipeRepository.insertAction({
      actorProfileId,
      targetProfileId,
      action: "interested",
      status: "pending",
    });
  }

  async accept(requesterProfileId: string, responderProfileId: string) {
    const pending = await this.swipeRepository.findPendingConnection(
      requesterProfileId,
      responderProfileId,
    );
    if (!pending) {
      throw new AppError(
        "Pending connection not found",
        404,
        "PENDING_CONNECTION_NOT_FOUND",
      );
    }
    await this.swipeRepository.updateStatus({
      actorProfileId: requesterProfileId,
      targetProfileId: responderProfileId,
      status: "accepted",
    });

    await matchingQueue.add(
      "matching",
      { connectionId: pending.id },
      { jobId: `matching-${pending.id}` },
    );
  }

  async reject(requesterProfileId: string, responderProfileId: string) {
    const pending = await this.swipeRepository.findPendingConnection(
      requesterProfileId,
      responderProfileId,
    );

    if (!pending) {
      throw new AppError(
        "Pending connection not found",
        404,
        "PENDING_CONNECTION_NOT_FOUND",
      );
    }

    await this.swipeRepository.updateStatus({
      actorProfileId: requesterProfileId,
      targetProfileId: responderProfileId,
      status: "rejected",
    });
  }

  private async ensureCanSwipe(
    actorProfileId: string,
    targetProfileId: string,
  ) {
    this.validateSelfSwipe(actorProfileId, targetProfileId);
    await this.ensureProfileExists(targetProfileId);

    const existing = await this.swipeRepository.findExistingAction(
      actorProfileId,
      targetProfileId,
    );

    if (existing) {
      throw new AppError(
        "Already acted on this profile",
        409,
        "DUPLICATE_ACTION",
      );
    }
  }
  private validateSelfSwipe(actor: string, target: string) {
    if (actor === target) {
      throw new AppError(
        "You cannot interact with your own profile",
        400,
        "SELF_ACTION_NOT_ALLOWED",
      );
    }
  }

  private async ensureProfileExists(targetProfileId: string) {
    const profile =
      await this.onboardingRepository.findProfileExists(targetProfileId);
    if (!profile) {
      throw new AppError("Profile not found", 404, "PROFILE_NOT_FOUND");
    }
  }
}
