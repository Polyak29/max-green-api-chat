export type GreenApiCredentials = {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl: string;
};

export type ChatMessage = {
  id: string;
  text: string;
  timestamp: number;
  direction: "incoming" | "outgoing";
};

export type ChatThread = {
  chatId: string;
  title: string;
  phoneNumber?: string;
  messages: ChatMessage[];
};

export type AppPersistedState = {
  credentials: GreenApiCredentials | null;
  chats: ChatThread[];
  activeChatId: string | null;
};

export type InstanceState =
  | "authorized"
  | "notAuthorized"
  | "blocked"
  | "sleepMode"
  | "starting"
  | "yellowCard"
  | "pendingPassword";
