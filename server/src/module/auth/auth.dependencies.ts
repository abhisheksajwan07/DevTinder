import { sessionService } from "../session/session.dependencies.js";
import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";
import { sessionRepository } from "../session/session.dependencies.js";
const authRepository = new AuthRepository();

export const authService = new AuthService(
  authRepository,
  sessionService,
  sessionRepository,
);
