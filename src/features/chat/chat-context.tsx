import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { loadPersistedState, savePersistedState } from "@/lib/storage";
import type {
  ChatMessage,
  ChatThread,
  GreenApiCredentials,
} from "@/lib/types";

type ChatContextValue = {
  credentials: GreenApiCredentials | null;
  chats: ChatThread[];
  activeChatId: string | null;
  activeChat: ChatThread | null;
  setCredentials: (credentials: GreenApiCredentials | null) => void;
  setActiveChatId: (chatId: string | null) => void;
  upsertChat: (chat: ChatThread) => void;
  appendMessage: (chatId: string, message: ChatMessage) => void;
  receiveIncomingMessage: (params: {
    chatId: string;
    title: string;
    phoneNumber?: string;
    message: ChatMessage;
  }) => void;
  logout: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const initial = loadPersistedState();

  const [credentials, setCredentialsState] = useState<
    GreenApiCredentials | null
  >(initial.credentials);

  const [chats, setChats] = useState<ChatThread[]>(initial.chats);

  const [activeChatId, setActiveChatIdState] = useState<string | null>(
    initial.activeChatId,
  );

  useEffect(() => {
    savePersistedState({ credentials, chats, activeChatId });
  }, [credentials, chats, activeChatId]);

  const setCredentials = useCallback((next: GreenApiCredentials | null) => {
    setCredentialsState(next);
  }, []);

  const setActiveChatId = useCallback((chatId: string | null) => {
    setActiveChatIdState(chatId);
  }, []);

  const upsertChat = useCallback((chat: ChatThread) => {
    setChats((current) => {
      const index = current.findIndex((item) => item.chatId === chat.chatId);
      if (index === -1) {
        return [chat, ...current];
      }

      return current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...chat } : item,
      );
    });
  }, []);

  const appendMessage = useCallback((chatId: string, message: ChatMessage) => {
    setChats((current) => {
      const index = current.findIndex((item) => item.chatId === chatId);
      if (index === -1) {
        return current;
      }

      const target = current[index];

      if (target.messages.some((item) => item.id === message.id)) {
        return current;
      }

      const updatedChat: ChatThread = {
        ...target,
        messages: [...target.messages, message],
      };

      const without = current.filter((item) => item.chatId !== chatId);

      return [updatedChat, ...without];
    });
  }, []);

  const receiveIncomingMessage = useCallback(
    (params: {
      chatId: string;
      title: string;
      phoneNumber?: string;
      message: ChatMessage;
    }) => {
      setChats((current) => {
        const index = current.findIndex((item) => item.chatId === params.chatId);
        const existing = index === -1 ? null : current[index];

        if (existing?.messages.some((item) => item.id === params.message.id)) {
          return current;
        }

        const updatedChat: ChatThread = {
          chatId: params.chatId,
          title: existing?.title || params.title,
          phoneNumber: existing?.phoneNumber || params.phoneNumber,
          messages: [...(existing?.messages ?? []), params.message],
        };

        const without = current.filter((item) => item.chatId !== params.chatId);

        return [updatedChat, ...without];
      });
    },
    [],
  );

  const logout = useCallback(() => {
    setCredentialsState(null);
    setChats([]);
    setActiveChatIdState(null);
  }, []);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.chatId === activeChatId) ?? null,
    [activeChatId, chats],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      credentials,
      chats,
      activeChatId,
      activeChat,
      setCredentials,
      setActiveChatId,
      upsertChat,
      appendMessage,
      receiveIncomingMessage,
      logout,
    }),
    [
      activeChat,
      activeChatId,
      appendMessage,
      chats,
      credentials,
      logout,
      receiveIncomingMessage,
      setActiveChatId,
      setCredentials,
      upsertChat,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }

  return context;
};
