import type { AppPersistedState } from "@/lib/types";

const STORAGE_KEY = "max-green-api-chat";

const defaultState: AppPersistedState = {
  credentials: null,
  chats: [],
  activeChatId: null,
};

export const loadPersistedState = (): AppPersistedState => {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as AppPersistedState;

    return {
      credentials: parsed.credentials ?? null,
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
      activeChatId: parsed.activeChatId ?? null,
    };
  } catch {
    return defaultState;
  }
};

export const savePersistedState = (state: AppPersistedState) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearPersistedState = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};
