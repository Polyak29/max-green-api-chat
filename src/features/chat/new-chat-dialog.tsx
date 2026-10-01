import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChatContext } from "@/features/chat/chat-context";
import {
  checkAccount,
  formatPhoneDisplay,
  formatPhoneNumber,
  GreenApiError,
  isValidPhoneNumber,
} from "@/lib/green-api";
import type { ChatThread } from "@/lib/types";

type NewChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const NewChatDialog = ({ open, onOpenChange }: NewChatDialogProps) => {
  const { credentials, chats, upsertChat, setActiveChatId } = useChatContext();
  const [phoneInput, setPhoneInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPhoneInput("");
      setError(null);
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    if (!credentials) {
      setError("Сначала выполните вход.");

      return;
    }

    const digits = formatPhoneNumber(phoneInput);
    if (!isValidPhoneNumber(digits)) {
      setError("Номер должен быть в формате 7XXXXXXXXXX или 375XXXXXXXXX.");

      return;
    }

    const existing = chats.find((chat) => chat.phoneNumber === digits);

    if (existing) {
      setActiveChatId(existing.chatId);
      handleClose(false);

      return;
    }

    setIsChecking(true);

    try {
      const result = await checkAccount(credentials, digits);

      if (result.status === false && result.reason) {
        setError(result.reason);

        return;
      }

      if (!result.exist || !result.chatId) {
        setError("На этом номере нет аккаунта MAX или номер недоступен.");

        return;
      }

      const chat: ChatThread = {
        chatId: result.chatId,
        title: formatPhoneDisplay(digits),
        phoneNumber: digits,
        messages: [],
      };

      upsertChat(chat);

      setActiveChatId(chat.chatId);

      toast.success("Чат создан");

      handleClose(false);
    } catch (checkError) {
      const message =
        checkError instanceof GreenApiError
          ? checkError.message
          : "Не удалось проверить номер.";

      setError(message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый чат</DialogTitle>
          <DialogDescription>
            Введите номер телефона получателя. Мы проверим наличие MAX через
            CheckAccount и сохраним chatId для отправки сообщений.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="phone">Номер телефона</Label>
            <Input
              id="phone"
              inputMode="tel"
              placeholder="79991234567"
              value={phoneInput}
              onChange={(event) => setPhoneInput(event.target.value)}
              autoComplete="tel"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isChecking}>
              {isChecking ? "Проверяем…" : "Создать чат"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
