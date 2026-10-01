import { ArrowLeft, Phone, Search, Video } from "lucide-react";
import { useState } from "react";

import { ChatAvatar } from "@/features/chat/chat-avatar";
import { ChatSidebar } from "@/features/chat/chat-sidebar";
import { MessageComposer } from "@/features/chat/message-composer";
import { MessageList } from "@/features/chat/message-list";
import { NewChatDialog } from "@/features/chat/new-chat-dialog";
import { useNotifications } from "@/features/chat/use-notifications";
import { useChatContext } from "@/features/chat/chat-context";
import { formatPhoneDisplay } from "@/lib/green-api";
import { cn } from "@/lib/utils";

export const ChatScreen = () => {
  const { chats, activeChatId, activeChat, setActiveChatId, logout } =
    useChatContext();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"list" | "thread">("list");

  useNotifications();

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);

    setMobilePanel("thread");
  };

  const handleBack = () => {
    setActiveChatId(null);

    setMobilePanel("list");
  };

  const showListOnMobile = mobilePanel === "list" || !activeChat;
  const subtitle = activeChat?.phoneNumber
    ? formatPhoneDisplay(activeChat.phoneNumber)
    : "личный чат";

  return (
    <div className="flex h-screen bg-white">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={() => setIsNewChatOpen(true)}
        onLogout={logout}
        mobileVisible={showListOnMobile}
      />

      <section
        className={cn(
          "relative min-w-0 flex-1 flex-col",
          !showListOnMobile ? "flex" : "hidden md:flex",
        )}
      >
        <div className="max-wallpaper absolute inset-0" aria-hidden />

        {activeChat ? (
          <>
            <header className="relative z-10 flex items-center gap-2 border-b border-black/5 bg-white px-2 py-2">
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full text-[#2f81f7] hover:bg-[#f2f4f7]"
                aria-label="К списку чатов"
                onClick={handleBack}
              >
                <ArrowLeft className="size-5" />
              </button>
              <ChatAvatar
                title={activeChat.title}
                chatId={activeChat.chatId}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[16px] font-semibold text-[#1c1c1e]">
                  {activeChat.title}
                </h2>
                <p className="truncate text-[12px] text-[#8b95a3]">{subtitle}</p>
              </div>
              <span className="flex items-center gap-1 pr-1 text-[#5f6b7a]" aria-hidden>
                <Phone className="mx-1.5 size-5" />
                <Video className="mx-1.5 size-5" />
                <Search className="mx-1.5 size-5" />
              </span>
            </header>

            <MessageList messages={activeChat.messages} />
            <MessageComposer chatId={activeChat.chatId} />
          </>
        ) : (
          <div className="relative z-10 flex flex-1 items-center justify-center p-6">
            <p className="rounded-full bg-white/80 px-4 py-2 text-sm text-[#5d6b7a] shadow-sm">
              Выберите чат или нажмите +, чтобы начать переписку
            </p>
          </div>
        )}
      </section>

      <NewChatDialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen} />
    </div>
  );
};
