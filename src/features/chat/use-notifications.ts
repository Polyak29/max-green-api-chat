import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useChatContext } from "@/features/chat/chat-context";
import {
  deleteNotification,
  enableIncomingNotifications,
  formatPhoneDisplay,
  GreenApiError,
  receiveNotification,
  toMessageTimestamp,
} from "@/lib/green-api";

const announcedInstances = new Set<string>();

const readIncomingText = (messageData: {
  typeMessage?: string;
  textMessageData?: { textMessage?: string };
  extendedTextMessageData?: { text?: string };
}) => {
  if (messageData.typeMessage === "textMessage") {
    return messageData.textMessageData?.textMessage?.trim() ?? "";
  }

  if (messageData.typeMessage === "extendedTextMessage") {
    return messageData.extendedTextMessageData?.text?.trim() ?? "";
  }

  return "";
};

export const useNotifications = () => {
  const { credentials, receiveIncomingMessage } = useChatContext();
  const runningRef = useRef(false);

  useEffect(() => {
    if (!credentials) {
      return;
    }

    const abortController = new AbortController();
    let webhookErrorShown = false;
    let settingsReady = false;

    const poll = async () => {
      if (runningRef.current) {
        return;
      }

      runningRef.current = true;

      try {
        await enableIncomingNotifications(credentials, abortController.signal);
        settingsReady = true;
        if (!announcedInstances.has(credentials.idInstance)) {
          announcedInstances.add(credentials.idInstance);
          toast.message(
            "Получение входящих включено. Если ответ уже был отправлен, напишите его ещё раз.",
          );
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          const message =
            error instanceof GreenApiError
              ? error.message
              : "Не удалось включить входящие уведомления.";
          toast.error(message);
        }
      }

      while (!abortController.signal.aborted) {
        try {
          const notification = await receiveNotification(
            credentials,
            20,
            abortController.signal,
          );

          if (abortController.signal.aborted) {
            break;
          }

          if (!notification?.receiptId || !notification.body) {
            continue;
          }

          const { body } = notification;
          const text =
            body.typeWebhook === "incomingMessageReceived" && body.messageData
              ? readIncomingText(body.messageData)
              : "";
          const chatId = body.senderData?.chatId;

          if (text && chatId) {
            const title =
              body.senderData?.chatName ||
              body.senderData?.senderName ||
              (body.senderData?.senderPhoneNumber
                ? formatPhoneDisplay(String(body.senderData.senderPhoneNumber))
                : chatId);

            receiveIncomingMessage({
              chatId,
              title,
              phoneNumber: body.senderData?.senderPhoneNumber
                ? String(body.senderData.senderPhoneNumber)
                : undefined,
              message: {
                id: body.idMessage ?? `${chatId}-${body.timestamp ?? Date.now()}`,
                text,
                timestamp: toMessageTimestamp(body.timestamp),
                direction: "incoming",
              },
            });
          }

          await deleteNotification(
            credentials,
            notification.receiptId,
            abortController.signal,
          );
        } catch (error) {
          if (abortController.signal.aborted) {
            break;
          }

          if (error instanceof GreenApiError) {
            const isWebhookConflict =
              error.message.toLowerCase().includes("webhook");

            if (isWebhookConflict && !webhookErrorShown) {
              webhookErrorShown = true;
              toast.error(
                settingsReady
                  ? "Очередь входящих недоступна. Подождите около минуты и обновите страницу."
                  : "В кабинете GREEN-API указан webhook URL. Очистите его, чтобы работала HTTP-очередь.",
              );
            }
          }

          await new Promise((resolve) => {
            window.setTimeout(resolve, 1500);
          });
        }
      }

      runningRef.current = false;
    };

    void poll();

    return () => {
      abortController.abort();
      runningRef.current = false;
    };
  }, [credentials, receiveIncomingMessage]);
};
