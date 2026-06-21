import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { AppError } from "../utils/AppError.js";
import { error } from "node:console";

type validateTarget = "body" | "params" | "query";

export const validate =
  (schema: ZodObject<any>, target: validateTarget = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const data = req[target];
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors = result.error.issues.map((err) => {
        return { field: err.path.join(""), message: err.message };
      });
      throw new AppError(
        errors.map((error) => `${error.field}:${error.message}`).join(", "),
        400,
      );
    }
    req[target] = result.data;
    next();
  };
