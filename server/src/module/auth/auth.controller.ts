// auth.controller.ts
import { Request, Response } from "express";
import { SignUpDto } from "./auth.validator.js";
import { authService } from "./auth.dependencies.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const registerController = async (
  req: Request<{}, {}, SignUpDto>,
  res: Response
) => {
  const result = await authService.runSignupPipeline(req.body);
  sendResponse(res, 201, result.message, null);
};