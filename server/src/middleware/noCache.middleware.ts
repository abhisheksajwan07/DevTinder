import { Request, Response, NextFunction } from "express";

export const noCache = (_req: Request, res: Response, next: NextFunction) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  next();
};
