import { ChatRepository } from "./chat.repository.js";
import { ChatService } from "./chat.service.js";

export const chatRepository = new ChatRepository();
export const chatService = new ChatService(chatRepository);
