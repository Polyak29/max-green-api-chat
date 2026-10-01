import { LogOut, Plus, Search } from "lucide-react";
import { useState } from "react";

import { ChatAvatar } from "@/features/chat/chat-avatar";
import { cn } from "@/lib/utils";
import type { ChatThread } from "@/lib/types";

type ChatSidebarProps = {
  chats: ChatThread[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
  mobileVisible: boolean;
};

const getLastMessagePreview = (chat: ChatThread) => {
  const last = chat.messages.at(-1);

  if (!last) {
    return "";
  }

  return last.text;
};

const formatListTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
};

export const ChatSidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onLogout,
  mobileVisible,
}: ChatSidebarProps) => {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleChats = normalizedQuery
    ? chats.filter((chat) => {
        const preview = getLastMessagePreview(chat).toLowerCase();

        return (
          chat.title.toLowerCase().includes(normalizedQuery) ||
          preview.includes(normalizedQuery)
        );
      })
    : chats;

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r border-[#e6e9ee] bg-white md:w-[380px] md:shrink-0",
        mobileVisible ? "flex" : "hidden md:flex",
      )}
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h1 className="text-[22px] font-semibold tracking-tight text-[#1c1c1e]">
          Чаты
        </h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-[#8b95a3] hover:bg-[#f2f4f7]"
            aria-label="Выйти"
            onClick={onLogout}
          >
            <LogOut className="size-5" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full bg-[#2f81f7] text-white shadow-sm hover:bg-[#1f74f0]"
            aria-label="Новый чат"
            onClick={onNewChat}
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>

      <div className="px-3 pb-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9aa3af]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти"
            aria-label="Найти чат"
            className="h-9 w-full rounded-full bg-[#f2f4f7] pr-3 pl-9 text-sm text-[#1c1c1e] outline-none placeholder:text-[#9aa3af] focus:ring-2 focus:ring-[#2f81f7]/30"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visibleChats.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#8b95a3]">
            {chats.length === 0
              ? "Нажмите +, чтобы начать чат по номеру"
              : "Ничего не найдено"}
          </p>
        ) : (
          visibleChats.map((chat) => {
            const last = chat.messages.at(-1);
            const isActive = chat.chatId === activeChatId;

            return (
              <button
                key={chat.chatId}
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#f4f8fc]",
                  isActive && "bg-[#e7f2ff] hover:bg-[#e7f2ff]",
                )}
                onClick={() => onSelectChat(chat.chatId)}
              >
                <ChatAvatar title={chat.title} chatId={chat.chatId} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[15px] font-semibold text-[#1c1c1e]">
                      {chat.title}
                    </span>
                    {last ? (
                      <span className="shrink-0 text-[12px] text-[#8b95a3]">
                        {formatListTime(last.timestamp)}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-[#8d96a3]">
                    {getLastMessagePreview(chat) || "Нет сообщений"}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
