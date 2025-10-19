import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  type: "user" | "assistant";
  timestamp?: string;
}

export function ChatMessage({
  message,
  type,
  timestamp,
}: ChatMessageProps) {
  return (
    <div
      className={`flex gap-3 ${
        type === "user" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          type === "assistant"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {type === "assistant" ? (
          <Bot className="w-5 h-5" />
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>
      <div
        className={`flex flex-col max-w-[75%] ${
          type === "user" ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            type === "assistant"
              ? "bg-secondary text-secondary-foreground rounded-tl-sm"
              : "bg-primary text-primary-foreground rounded-tr-sm"
          }`}
        >
          <p className="whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 px-1">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}