import { SwipeRepository } from "./swipe.repository.js";
import { SwipeService } from "./swipe.service.js";

import { repository as onboardingRepository } from "../onboarding/onboarding.dependencies.js";

export const swipeRepository = new SwipeRepository();

export const service = new SwipeService(swipeRepository, onboardingRepository);
