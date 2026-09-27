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

  async getUserConversations(
    profileId: string,
    cursor?: string,
    limit?: number,
  ) {
    const paginated = await this.chatRepository.getUserConversations(
      profileId,
      cursor,
      limit,
    );
    if (!paginated || paginated.items.length === 0) return paginated;

    const otherProfileIds = paginated.items.map((c) => c.otherProfileId);
    const onlineStatuses =
      await this.presenceService.getOnlineStatuses(otherProfileIds);

    return {
      ...paginated,
      items: paginated.items.map((c) => ({
        ...c,
        isOnline: !!onlineStatuses[c.otherProfileId],
      })),
    };
  }

  async getConversationMessage(
    conversationId: string,
    profileId: string,
    cursor?: string,
  ) {
    await this.ensureConversationMember(conversationId, profileId);
    return this.chatRepository.getConversationMessages(conversationId, cursor);
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







