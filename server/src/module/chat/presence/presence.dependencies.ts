import { redis } from "../../../config/redis.js";
import { PresenceRepository } from "./presence.repository.js";
import { PresenceService } from "./presence.service.js";

export const presenceRepository = new PresenceRepository(redis);
export const presenceService = new PresenceService(presenceRepository);
