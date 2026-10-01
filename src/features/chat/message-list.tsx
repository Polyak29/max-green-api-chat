import { CheckCheck } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

type MessageListProps = {
  messages: ChatMessage[];
};

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

const formatDayLabel = (timestamp: number) => {
  const date = new Date(timestamp);

  const now = new Date();

  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();

  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(date)) / 86_400_000,
  );

  if (diffDays === 0) {
    return "Сегодня";
  }

  if (diffDays === 1) {
    return "Вчера";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(date);
};

export const MessageList = ({ messages }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-3">
      <div className="mx-auto flex max-w-3xl flex-col">
        {messages.map((message, index) => {
          const isOutgoing = message.direction === "outgoing";
          const previous = messages[index - 1];
          const showDay =
            !previous ||
            formatDayLabel(previous.timestamp) !==
              formatDayLabel(message.timestamp);
          const sameDirection =
            previous?.direction === message.direction && !showDay;

          return (
            <div key={message.id}>
              {showDay ? (
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-[12px] text-[#5d6b7a] shadow-sm">
                    {formatDayLabel(message.timestamp)}
                  </span>
                </div>
              ) : null}
              <div
                className={cn(
                  "flex",
                  sameDirection ? "mt-1" : "mt-2",
                  isOutgoing ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] px-3 py-1.5 text-[15px] leading-5 text-[#1c1c1e] shadow-[0_1px_1px_rgba(16,40,64,0.08)]",
                    isOutgoing
                      ? "rounded-[18px] rounded-br-[5px] bg-[#d4f4ff]"
                      : "rounded-[18px] rounded-bl-[5px] bg-white",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {message.text}
                    <span
                      className={cn(
                        "float-right mt-1 ml-2 inline-flex translate-y-0.5 items-center gap-0.5 text-[11px] leading-none",
                        isOutgoing ? "text-[#3f93b0]" : "text-[#8e98a4]",
                      )}
                    >
                      {formatTime(message.timestamp)}
                      {isOutgoing ? (
                        <CheckCheck className="size-3.5" aria-hidden />
                      ) : null}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
