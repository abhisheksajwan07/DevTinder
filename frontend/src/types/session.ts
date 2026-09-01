export type Session = {
  id: string;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  city: string | null;
  country: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  isCurrent: boolean;
};
