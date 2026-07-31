## Auth Refactors

### Split Session & Token Responsibilities

**Current:** `issueTokenPair()` creates the session and signs JWTs.

**Refactor:** Split into separate services:

- `SessionService` → session CRUD (DB only)
- `TokenService` → access/refresh token generation

This makes database transactions cleaner and keeps each service focused on one responsibility.

**Location:** `auth.service.ts`, `session.service.ts`

---

### Wrap Email Verification in a Transaction

**Current:** Email verification and session creation happen as separate database operations.

**Refactor:** Wrap `markEmailVerified()` and session creation in a single DB transaction so they either both succeed or both roll back.

**Location:** `auth.service.ts` → `verifyEmail()`

---

## Refresh Token Theft Detection

**Problem:** If a stolen refresh token is used before the legitimate user, the attacker receives a new refresh token while the real user later gets a 401.

**Fix:** Implement refresh token family invalidation.

- On refresh token reuse, revoke all active sessions for that user.
- Log the event for auditing.
- Force the user to sign in again.

**Location:** `session.service.ts` → `refreshSession()`

## Onboarding Changes

- isOnboarded in JWT now
- Remove it in Security Hardening when requireAccessAuth gets DB session validation

## SWIPE EDGE CASE

- right now users can technically swipe on profiles not shown in the feed
- feed_impressions table + validation in swipe service.

## redis persistence

- Redis persistence not configured
- Job loss possible on Redis restart
- Fix: Enable AOF persistence in production Redis config

## Session validation for token revocation

- Risk: logged out access token remain valid until expiry (15min window)
- After verifying the JWT, the server validates the associated session against the database to ensure that:

  The session exists.
  The session has not been revoked.
  The session has not expired.

  This enables immediate token invalidation after logout or forced session revocation, even if the access token itself has not yet expired
