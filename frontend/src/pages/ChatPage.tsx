import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConversationList from "../components/chat/ConversationList";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessagesList from "../components/chat/ChatMessagesList";
import ChatComposer from "../components/chat/ChatComposer";
import ChatEmptyState from "../components/chat/ChatEmptyState";
import ProfilePanel, {
  type ChatParticipantInfo,
} from "../components/chat/ProfilePanel";
import { useConversations, useConversationMessages } from "../hooks/chat.hooks";
import { useAuthStore } from "../stores/auth.store";
import { useChatSocket } from "../hooks/useChatSocket";
import type { ConversationListItem } from "../types/chat";
import { useMyProfile } from "../hooks/profile.hooks";

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const authUser = useAuthStore((state) => state.user);
  const { data: myProfile } = useMyProfile();
  // Prefer the live profile returned by the backend over a possibly stale
  // persisted auth-store value. Message alignment depends on this ID.
  const myProfileId = myProfile?.id ?? authUser?.profileId;

  const { data: conversations = [], isLoading: isConversationsLoading } =
    useConversations();

  const { data: serverMessages = [], isLoading: isMessagesLoading } =
    useConversationMessages(conversationId);

  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  const { isOtherUserTyping, handleSendMessage, handleInputChange } =
    useChatSocket({
      conversationId,
      myProfileId,
      inputText,
      setInputText,
    });

  const activeConversation: ConversationListItem | null =
    conversations.find((c) => c.conversationId === conversationId) ?? null;

  //
  const filteredConversations = conversations.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      c.username.toLowerCase().includes(query) ||
      (c.lastMessage?.content?.toLowerCase().includes(query) ?? false)
    );
  });

  // Scroll to bottom helper
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom(serverMessages.length === 0 ? "auto" : "smooth");
  }, [
    serverMessages.length,
    isOtherUserTyping,
    conversationId,
    scrollToBottom,
  ]);

  const participantInfo: ChatParticipantInfo | null = activeConversation
    ? {
        profileId: activeConversation.otherProfileId,
        name:
          `${activeConversation.firstName} ${activeConversation.lastName}`.trim() ||
          activeConversation.username,
        username: activeConversation.username,
        avatarUrl: activeConversation.avatarUrl,
      }
    : null;

  return (
    <div className="relative flex h-[calc(100dvh-56px-64px)] min-w-0 overflow-hidden bg-[#f7f5f2] lg:h-screen">
      {/* -- 1. Left Sidebar: Conversations List─ */}
      <ConversationList
        conversations={filteredConversations}
        isLoading={isConversationsLoading}
        activeConversationId={conversationId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectConversation={(id) => navigate(`/app/chat/${id}`)}
        isMobileChatOpen={Boolean(conversationId)}
      />

      {/* -- 2. Center: Active Chat Window---- */}
      {conversationId && activeConversation ? (
        <main
          className={`
            ${conversationId ? "flex" : "hidden"}
            lg:flex flex-col flex-1 min-w-0 bg-[#f7f5f2] relative
          `}
        >
          {/* Header */}
          <ChatHeader
            conversation={activeConversation}
            showProfilePanel={showProfilePanel}
            onBack={() => navigate("/app/chat")}
            onToggleProfile={() => setShowProfilePanel(!showProfilePanel)}
          />

          {/* Messages Stream */}
          <ChatMessagesList
            ref={messagesEndRef}
            messages={serverMessages}
            isLoading={isMessagesLoading}
            activeConversation={activeConversation}
            myProfileId={myProfileId}
            isOtherUserTyping={isOtherUserTyping}
          />

          {/* Composer */}
          <ChatComposer
            input={inputText}
            setInput={handleInputChange}
            handleSend={handleSendMessage}
          />
        </main>
      ) : (
        /* Empty State */
        <ChatEmptyState />
      )}

      {/* -- 3. Right Sidebar: Profile Panel-- */}
      {showProfilePanel && participantInfo && (
        <ProfilePanel
          participant={participantInfo}
          onClose={() => setShowProfilePanel(false)}
        />
      )}
    </div>
  );
}
