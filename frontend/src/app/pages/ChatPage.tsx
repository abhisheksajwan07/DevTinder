import { useState, useRef, useEffect } from "react";
import { conversations, currentUser, type Conversation, type Message } from "../mock-data";
import { ArrowLeft, MoreHorizontal, User, Search } from "lucide-react";
import ConversationItem from "../../components/chat/ConversationItem";
import ChatBubble from "../../components/chat/ChatBubble";
import ChatComposer from "../../components/chat/ChatComposer";
import ProfilePanel from "../../components/chat/ProfilePanel";

export default function ChatPage() {
  const [activeConvId, setActiveConvId] = useState<string | null>(conversations[0].id);
  const [localConvs, setLocalConvs] = useState<Conversation[]>(conversations);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = localConvs.find((c) => c.id === activeConvId) ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, localConvs]);

  const handleSend = () => {
    if (!input.trim() || !activeConvId) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };

    setLocalConvs((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: newMsg.text,
              lastTimestamp: newMsg.timestamp,
              unreadCount: 0,
            }
          : c
      )
    );
    setInput("");

    // Simulate typing response
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    setMobileShowChat(true);
    // Mark read
    setLocalConvs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] lg:h-screen overflow-hidden bg-[#f7f5f2]">
      {/* ── Conversation List ── */}
      <div
        className={`${
          mobileShowChat ? "hidden" : "flex"
        } lg:flex flex-col w-full lg:w-[300px] xl:w-[340px] shrink-0 bg-white border-r border-[#e9e5df]`}
      >
        <div className="p-4 border-b border-[#f0ece6]">
          <h2 className="text-base font-bold text-[#242322] mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#88827c]" />
            <input
              type="search"
              placeholder="Search conversations..."
              className="w-full rounded-2xl border border-[#e2ded6] bg-[#f7f5f2] pl-10 pr-4 py-2.5 text-xs font-medium outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#f0ece6]">
          {localConvs.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeConvId}
              onClick={() => handleSelectConv(conv.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Active Chat ── */}
      {activeConv ? (
        <div
          className={`${
            mobileShowChat ? "flex" : "hidden"
          } lg:flex flex-col flex-1 min-w-0`}
        >
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 lg:px-6 py-4 border-b border-[#e9e5df] bg-white shrink-0">
            <button
              type="button"
              onClick={() => setMobileShowChat(false)}
              className="lg:hidden flex items-center justify-center rounded-xl border border-[#e9e5df] p-2 text-[#55504b] hover:bg-[#f7f5f2] transition"
            >
              <ArrowLeft className="size-4" />
            </button>

            <div className="relative">
              <div
                className="size-10 rounded-2xl grid place-items-center text-white font-bold text-xs shadow-xs"
                style={{ backgroundColor: activeConv.participant.avatarColor }}
              >
                {activeConv.participant.avatar}
              </div>
              {activeConv.participant.isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#242322] truncate">
                {activeConv.participant.name}
              </p>
              <p className="font-mono text-[10px] text-[#77736e]">
                {activeConv.participant.isOnline ? (
                  <span className="text-emerald-600">● Online now</span>
                ) : (
                  "Last seen recently"
                )} · {activeConv.participant.role}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowProfile(!showProfile)}
                className="hidden xl:flex items-center justify-center rounded-xl border border-[#e9e5df] p-2 text-[#55504b] hover:bg-[#f7f5f2] transition"
              >
                <User className="size-4" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-xl border border-[#e9e5df] p-2 text-[#55504b] hover:bg-[#f7f5f2] transition"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 space-y-3">
            {/* Date separator */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#e9e5df]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#88827c]">
                Today
              </span>
              <div className="h-px flex-1 bg-[#e9e5df]" />
            </div>

            {activeConv.messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                isOwn={msg.senderId === currentUser.id}
              />
            ))}

            {isTyping && (
              <div className="flex items-end gap-2">
                <div
                  className="size-7 rounded-xl grid place-items-center text-white font-bold text-[10px] shrink-0"
                  style={{ backgroundColor: activeConv.participant.avatarColor }}
                >
                  {activeConv.participant.avatar}
                </div>
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white border border-[#e9e5df] px-4 py-3">
                  <span className="size-1.5 rounded-full bg-[#88827c] animate-bounce [animation-delay:0ms]" />
                  <span className="size-1.5 rounded-full bg-[#88827c] animate-bounce [animation-delay:150ms]" />
                  <span className="size-1.5 rounded-full bg-[#88827c] animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <ChatComposer
            input={input}
            setInput={setInput}
            handleSend={handleSend}
          />
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm font-semibold text-[#242322]">Select a conversation</p>
            <p className="text-xs text-[#77736e] mt-1">Choose a match to start messaging</p>
          </div>
        </div>
      )}

      {/* Profile Side Panel */}
      {showProfile && activeConv && (
        <ProfilePanel participant={activeConv.participant} />
      )}
    </div>
  );
}
