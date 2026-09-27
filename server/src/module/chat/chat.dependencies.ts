import { ChatRepository } from "./chat.repository.js";
import { ChatService } from "./chat.service.js";
import { presenceService } from "./presence/presence.dependencies.js";
import { redis } from "../../config/redis.js";

export const chatRepository = new ChatRepository(redis);
export const chatService = new ChatService(chatRepository, presenceService);
