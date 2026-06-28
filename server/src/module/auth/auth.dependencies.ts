import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";

const authRepository = new AuthRepository();
export const authService = new AuthService(authRepository);
