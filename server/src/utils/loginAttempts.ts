const LOGIN_MAX = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export const isAccountLocked = (lockedUntil: Date | null): boolean => {
  return Boolean(lockedUntil && lockedUntil.getTime() > Date.now());
};

export const getNextLoginAttemptData = (currentAttempts: number) => {
  const next = currentAttempts + 1;
  if (next >= LOGIN_MAX) {
    return {
      loginAttempts:next,
      lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
    };
  }
  return {
    loginAttempts: next,
    lockedUntil: null,
  };
};

export const getClearedAttemptData = () => ({
  loginAttempts: 0,
  lockedUntil: null,
});
