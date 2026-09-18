import { afterEach, vi } from "vitest";

afterEach(() => {
  vi.clearAllMocks();
});

// Route tests should not require Redis merely because a route has a limiter.
// Test rate limiters separately, with their own focused setup.
const passThrough = (_req: unknown, _res: unknown, next: () => void) => next();

vi.mock("../../middleware/rate-limit/auth.rate-limit.js", () => ({
  signupLimiter: passThrough,
  verifyEmailLimiter: passThrough,
  resendOtpLimiter: passThrough,
  signInLimiter: passThrough,
  forgotPasswordLimiter: passThrough,
  resetPasswordLimiter: passThrough,
}));
vi.mock("../../middleware/rate-limit/session.rate-limit.js", () => ({
  refreshLimiter: passThrough,
  sessionReadLimiter: passThrough,
}));
vi.mock("../../middleware/rate-limit/onboarding.rate-limit.js", () => ({
  onboardingLimiter: passThrough,
  onboardingPatchLimiter: passThrough,
  onboardingOptionsReadLimiter: passThrough,
  onboardingProfileReadLimiter: passThrough,
  usernameAvailabilityLimiter: passThrough,
  publicProfileReadLimiter: passThrough,
}));
vi.mock("../../middleware/rate-limit/feed.rate-limit.js", () => ({
  feedReadLimiter: passThrough,
}));
vi.mock("../../middleware/rate-limit/swipe.rate-limit.js", () => ({
  swipeLimiter: passThrough,
}));
vi.mock("../../middleware/rate-limit/github.rate-limit.js", () => ({
  githubSyncLimiter: passThrough,
  githubStatusReadLimiter: passThrough,
  githubProfileReadLimiter: passThrough,
  githubFeaturedRepositoriesLimiter: passThrough,
}));
vi.mock("../../middleware/rate-limit/oauth.rate-limit.js", () => ({
  oauthCallbackLimiter: passThrough,
  oauthRedirectLimiter: passThrough,
}));
