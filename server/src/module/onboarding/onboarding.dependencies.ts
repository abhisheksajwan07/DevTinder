import { OnBoardingRepository } from "./onboarding.repository.js";
import { OnboardingService } from "./onboarding.service.js";

export const repository = new OnBoardingRepository();
export const service = new OnboardingService(repository);