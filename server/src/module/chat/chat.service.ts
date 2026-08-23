import { AppError } from "../../utils/AppError.js";
import { IChatRepository, SendMessageDTO } from "./chat.types.js";
import { PresenceService } from "./presence/presence.service.js";

export class ChatService {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly presenceService: PresenceService,
  ) {}

  private async ensureConversationMember(
    conversationId: string,
    profileId: string,
  ): Promise<void> {
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
  }

  async getUserConversations(profileId: string) {
    const conversations =
      await this.chatRepository.getUserConversations(profileId);
    if (!conversations || conversations.length === 0) {
      return conversations;
    }

    const otherProfileIds = conversations.map((c) => c.otherProfileId);
    const onlineStatuses =
      await this.presenceService.getOnlineStatuses(otherProfileIds);

    return conversations.map((c) => ({
      ...c,
      isOnline: !!onlineStatuses[c.otherProfileId],
    }));
  }

  async getConversationMessage(conversationId: string, profileId: string) {
    await this.ensureConversationMember(conversationId, profileId);
    return this.chatRepository.getConversationMessages(conversationId);
  }

  async sendMessage(
    conversationId: string,
    senderProfileId: string,
    payload: SendMessageDTO,
  ) {
    await this.ensureConversationMember(conversationId, senderProfileId);
    return this.chatRepository.createMessage({
      conversationId,
      senderProfileId,
      ...payload,
    });
  }

  async joinConversation(
    conversationId: string,
    profileId: string,
  ): Promise<void> {
    await this.ensureConversationMember(conversationId, profileId);
  }

  async markConversationAsRead(
    conversationId: string,
    profileId: string,
  ): Promise<number> {
     await this.ensureConversationMember(conversationId, profileId);
    return await this.chatRepository.markMessagesAsRead(conversationId, profileId);
  }
}







