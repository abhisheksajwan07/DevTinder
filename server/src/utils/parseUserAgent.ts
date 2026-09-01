import { UAParser } from "ua-parser-js";

export type ParsedUserAgent = {
  browser: string;
  os: string;
  deviceType: string;
};

export const parseUserAgent = (userAgent?: string): ParsedUserAgent | null => {
  if (!userAgent) return null;
  const parser = new UAParser(userAgent);

  return {
    browser: parser.getBrowser().name ?? "Unknown",
    os:
      [parser.getOS().name, parser.getOS().version].filter(Boolean).join(" ") ||
      "Unknown",
    deviceType: parser.getDevice().type ?? "desktop",
  };
};
