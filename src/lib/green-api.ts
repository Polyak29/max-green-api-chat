import type { GreenApiCredentials, InstanceState } from "@/lib/types";

const DEFAULT_API_URL = "https://api.greenapi.com";

export const normalizeApiUrl = (apiUrl: string) => {
  const trimmed = apiUrl.trim().replace(/\/+$/, "");
  return trimmed || DEFAULT_API_URL;
};

export class GreenApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "GreenApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

const buildInstancePath = (
  credentials: GreenApiCredentials,
  suffix: string,
) => {
  const id = credentials.idInstance.trim();
  const token = credentials.apiTokenInstance.trim();

  return `/waInstance${id}${suffix}${token}`;
};

const isAllowedGreenHost = (apiUrl: string) => {
  try {
    const url = new URL(apiUrl);
    const host = url.hostname;
    return (
      url.protocol === "https:" &&
      (host === "api.greenapi.com" ||
        host === "api.green-api.com" ||
        host.endsWith(".green-api.com"))
    );
  } catch {
    return false;
  }
};

const resolveRequestUrl = (
  credentials: GreenApiCredentials,
  path: string,
) => {
  const apiUrl = normalizeApiUrl(credentials.apiUrl);

  if (isAllowedGreenHost(apiUrl)) {
    return `/api/green${path}`;
  }

  return `${apiUrl}${path}`;
};

const request = async <T>(
  credentials: GreenApiCredentials,
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const url = resolveRequestUrl(credentials, path);

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (url.startsWith("/api/green")) {
    headers["X-Green-Base"] = normalizeApiUrl(credentials.apiUrl);
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body:
      options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const text = await response.text();

  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const rawMessage =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : typeof payload === "string" && payload
          ? payload
          : "";
    const looksLikeHtml = /<!doctype|<html/i.test(rawMessage);
    const message = looksLikeHtml
      ? `Ошибка API (${response.status})`
      : rawMessage.slice(0, 240) || `Ошибка API (${response.status})`;

    throw new GreenApiError(message, response.status);
  }

  return payload as T;
};

export type GetStateInstanceResponse = {
  stateInstance: InstanceState;
};

export const getStateInstance = (
  credentials: GreenApiCredentials,
  signal?: AbortSignal,
) =>
  request<GetStateInstanceResponse>(
    credentials,
    buildInstancePath(credentials, "/getStateInstance/"),
    { signal },
  );

export type CheckAccountResponse = {
  exist?: boolean;
  chatId?: string;
  status?: boolean;
  reason?: string;
};

export const checkAccount = (
  credentials: GreenApiCredentials,
  phoneNumber: string,
  signal?: AbortSignal,
) =>
  request<CheckAccountResponse>(
    credentials,
    buildInstancePath(credentials, "/checkAccount/"),
    {
      method: "POST",
      body: { phoneNumber: Number(phoneNumber) },
      signal,
    },
  );

export type SendMessageResponse = {
  idMessage: string;
};

export const sendMessage = (
  credentials: GreenApiCredentials,
  chatId: string,
  message: string,
  signal?: AbortSignal,
) =>
  request<SendMessageResponse>(
    credentials,
    buildInstancePath(credentials, "/sendMessage/"),
    {
      method: "POST",
      body: { chatId, message },
      signal,
    },
  );

export type IncomingTextNotification = {
  receiptId: number;
  body: {
    typeWebhook: string;
    idMessage?: string;
    timestamp?: number;
    senderData?: {
      chatId?: string;
      chatName?: string;
      senderName?: string;
      senderPhoneNumber?: number;
    };
    messageData?: {
      typeMessage?: string;
      textMessageData?: {
        textMessage?: string;
      };
      extendedTextMessageData?: {
        text?: string;
      };
    };
  };
};

export const receiveNotification = (
  credentials: GreenApiCredentials,
  receiveTimeout = 20,
  signal?: AbortSignal,
) =>
  request<IncomingTextNotification | null>(
    credentials,
    `${buildInstancePath(credentials, "/receiveNotification/")}?receiveTimeout=${receiveTimeout}`,
    { signal },
  );

export const deleteNotification = (
  credentials: GreenApiCredentials,
  receiptId: number,
  signal?: AbortSignal,
) =>
  request<{ result?: boolean }>(
    credentials,
    `${buildInstancePath(credentials, "/deleteNotification/")}/${receiptId}`,
    { method: "DELETE", signal },
  );

export const enableIncomingNotifications = (
  credentials: GreenApiCredentials,
  signal?: AbortSignal,
) =>
  request<{ saveSettings?: boolean }>(
    credentials,
    buildInstancePath(credentials, "/setSettings/"),
    {
      method: "POST",
      body: {
        webhookUrl: "",
        incomingWebhook: "yes",
        outgoingWebhook: "yes",
        outgoingAPIMessageWebhook: "yes",
        stateWebhook: "yes",
      },
      signal,
    },
  );

export const toMessageTimestamp = (timestamp?: number) => {
  if (!timestamp) {
    return Date.now();
  }

  return timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
};

export const formatPhoneNumber = (value: string) => value.replace(/\D/g, "");

export const isValidPhoneNumber = (digits: string) =>
  (digits.length === 11 && digits.startsWith("7")) ||
  (digits.length === 12 && digits.startsWith("375"));

export const formatPhoneDisplay = (digits: string) => {
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }

  if (digits.length === 12 && digits.startsWith("375")) {
    return `+375 (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`;
  }

  return digits ? `+${digits}` : "";
};

export const instanceStateLabel: Record<InstanceState, string> = {
  authorized: "Авторизован",
  notAuthorized: "Не авторизован",
  blocked: "Заблокирован",
  sleepMode: "Режим сна",
  starting: "Запуск",
  yellowCard: "Ограничения",
  pendingPassword: "Требуется пароль 2FA",
};
