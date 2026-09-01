export interface ChatMessage {
  id: string;
  conversationId: string;
  senderProfileId: string;
  type: "text" | "image" | "file";
  content: string;
  createdAt: string;
  readAt: string | null;
}

export interface ConversationListItem {
  conversationId: string;
  lastMessageAt: string | null;

  otherProfileId: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;

  lastMessage: {
    messageId: string;
    senderProfileId: string;
    type: string;
    content: string;
    createdAt: string;
  } | null;

  isOnline: boolean;
  unreadCount: number;
}
