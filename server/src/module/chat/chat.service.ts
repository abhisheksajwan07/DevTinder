import { AppError } from "../../utils/AppError.js";
import { IChatRepository, SendMessageDTO } from "./chat.types.js";

export class ChatService {
  constructor(private readonly chatRepository: IChatRepository) {}

  async getUserConversations(profileId: string) {
    return this.chatRepository.getUserConversations(profileId);
  }

  async getConversationMessage(conversationId: string, profileId: string) {
    const isMember = await this.chatRepository.isConversationMember(
      conversationId,
      profileId,
    );

    if (!isMember) {
      throw new AppError(
        "Conversation not found.",
        404,
        "CONVERSATION_NOT_FOUND",
      );
    }
    return this.chatRepository.getConversationMessages(conversationId);
  }

  async sendMessage(
    conversationId: string,
    senderProfileId: string,
    payload: SendMessageDTO,
  ) {
    const isMember = await this.chatRepository.isConversationMember(
      conversationId,
      senderProfileId,
    );
    if (!isMember) {
      throw new AppError(
        "Conversation not found.",
        404,
        "CONVERSATION_NOT_FOUND",
      );
    }
    return this.chatRepository.createMessage({
      conversationId,
      senderProfileId,
      ...payload,
    });
  }
}
