import { SessionRepository } from "./session.repository.js";
import { SessionService } from "./session.service.js";

export const sessionRepository = new SessionRepository();
export const sessionService = new SessionService(sessionRepository);
