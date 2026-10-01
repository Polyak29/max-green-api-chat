import { Camera, Mic, Paperclip, SendHorizontal, Smile } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useChatContext } from "@/features/chat/chat-context";
import { GreenApiError, sendMessage } from "@/lib/green-api";

type MessageComposerProps = {
  chatId: string;
};

export const MessageComposer = ({ chatId }: MessageComposerProps) => {
  const { credentials, appendMessage } = useChatContext();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const hasText = text.trim().length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = text.trim();

    if (!trimmed || !credentials) {
      return;
    }

    if (trimmed.length > 4000) {
      toast.error("Сообщение не должно превышать 4000 символов.");

      return;
    }

    setIsSending(true);

    try {
      const response = await sendMessage(credentials, chatId, trimmed);

      appendMessage(chatId, {
        id: response.idMessage,
        text: trimmed,
        timestamp: Date.now(),
        direction: "outgoing",
      });

      setText("");
    } catch (sendError) {
      const message =
        sendError instanceof GreenApiError
          ? sendError.message
          : "Не удалось отправить сообщение.";

      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      event.currentTarget.form?.requestSubmit();
    }
  };

  const handleUnavailable = () => {
    toast.message("В этом задании доступны только текстовые сообщения");
  };

  return (
    <form
      className="relative z-10 flex items-center gap-2 px-3 py-3"
      onSubmit={handleSubmit}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-white px-2 py-1 shadow-[0_1px_2px_rgba(16,40,64,0.12)]">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-[#6d7784] hover:bg-[#f2f4f7]"
          aria-label="Эмодзи"
          onClick={handleUnavailable}
        >
          <Smile className="size-5" />
        </button>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение"
          aria-label="Текст сообщения"
          disabled={isSending}
          maxLength={4000}
          className="h-9 min-w-0 flex-1 bg-transparent text-[15px] text-[#1c1c1e] outline-none placeholder:text-[#9aa3af]"
        />
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-[#6d7784] hover:bg-[#f2f4f7]"
          aria-label="Прикрепить файл"
          onClick={handleUnavailable}
        >
          <Paperclip className="size-5" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-[#6d7784] hover:bg-[#f2f4f7]"
          aria-label="Камера"
          onClick={handleUnavailable}
        >
          <Camera className="size-5" />
        </button>
        {hasText ? (
          <button
            type="submit"
            className="flex size-9 items-center justify-center rounded-full text-[#2f81f7] hover:bg-[#e7f2ff] disabled:opacity-50"
            aria-label="Отправить сообщение"
            disabled={isSending}
          >
            <SendHorizontal className="size-5" />
          </button>
        ) : (
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-[#6d7784] hover:bg-[#f2f4f7]"
            aria-label="Голосовое сообщение"
            onClick={handleUnavailable}
          >
            <Mic className="size-5" />
          </button>
        )}
      </div>
    </form>
  );
};
