import geoip from "geoip-lite";

export type ParsedLocation = {
  city: string | null;
  country: string | null;
};

export const parseIp = (ip?: string): ParsedLocation | null => {
  if (!ip) return null;
  const geo = geoip.lookup(ip);

  if (!geo) return null;
  return {
    city: geo.city ?? null,
    country: geo.country ?? null,
  };
};
