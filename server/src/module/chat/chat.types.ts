import { InferSelectModel } from "drizzle-orm";
import { messages } from "./../../db/schema/message.schema.js";

export type Message = InferSelectModel<typeof messages>;

export interface SendMessageDTO {
  type: Message["type"];
  content: string;
}

export interface CreateMessageInput extends SendMessageDTO {
  conversationId: string;
  senderProfileId: string;
}

export type LastMessage = {
  messageId: string;
  senderProfileId: string;
  type: string;
  content: string;
  createdAt: Date;
};
export type ConversationRow = {
  conversation_id: string;
  last_message_at: Date | null;
  other_profile_id: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string | null;
  message_id: string | null;
  sender_profile_id: string | null;
  type: string | null;
  content: string | null;
  created_at: Date | null;
  unread_count: number;
};
export type ConversationListItem = {
  conversationId: string;
  lastMessageAt: Date | null;
  otherProfileId: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  lastMessage: LastMessage | null;
  isOnline: boolean;
  unreadCount: number;
};


export type ConversationCursor = {
  lastMessageAt: string | null; 
  createdAt: string;            
};

export type PaginatedConversations = {
  items: ConversationListItem[];
  nextCursor: string | null; 
};


export type MessageCursor = {
  createdAt: string; 
  messageId: string; 
};

export type PaginatedMessages = {
  messages: Message[];
  nextCursor: string | null; 
};

export interface IChatRepository {
  createMessage(input: CreateMessageInput): Promise<Message>;

  isConversationMember(
    conversationId: string,
    profileId: string,
  ): Promise<boolean>;

  getConversationMessages(
    conversationId: string,
    cursor?: string,
    limit?: number,
  ): Promise<PaginatedMessages>;

  getUserConversations(
    profileId: string,
    cursor?: string,
    limit?: number,
  ): Promise<PaginatedConversations | undefined>;

  markMessagesAsRead(
    conversationId: string,
    profileId: string,
  ): Promise<number>;

  getConversationMembersProfileIds(profileId: string): Promise<string[]>;

  getConversationParticipantProfileIds(conversationId: string): Promise<string[]>;

  getRecipientEmail(
    profileId: string,
  ): Promise<{ email: string; firstName: string } | null>;
}
