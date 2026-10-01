import { User } from "lucide-react";

import { cn } from "@/lib/utils";

const palette = [
  "#5b8def",
  "#7c6cf0",
  "#e36b6b",
  "#3db8a0",
  "#f0a04b",
  "#5c6bc0",
  "#d46bb5",
];

const colorForId = (chatId: string) => {
  const hash = [...chatId].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );

  return palette[hash % palette.length];
};

const initialsFor = (title: string) => {
  const words = title
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].slice(0, 1).toUpperCase();
  }

  return `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`.toUpperCase();
};

type ChatAvatarProps = {
  title: string;
  chatId: string;
  size?: "md" | "sm";
};

export const ChatAvatar = ({ title, chatId, size = "md" }: ChatAvatarProps) => {
  const digits = title.replace(/\D/g, "");
  const isPhone = digits.length >= 10;
  const iconSize = size === "md" ? "size-6" : "size-5";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        size === "md" ? "size-12 text-[16px]" : "size-10 text-[14px]",
      )}
      style={{ backgroundColor: colorForId(chatId) }}
      aria-hidden
    >
      {isPhone ? <User className={iconSize} /> : initialsFor(title)}
    </span>
  );
};
