## Refresh Token Theft Detection

**Problem:** If a stolen refresh token is used before the legit user,
the attacker gets a new token. Legit user hits 401. No alert, no trace.

**Fix:** Implement refresh token family invalidation.
- On any suspicious reuse → revoke ALL sessions for that userId
- Log the event for audit

**Location:** `session.service.ts` → `refreshSession()`