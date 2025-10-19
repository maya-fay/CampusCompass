import { User, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  responseSource?: 'llm' | 'fallback' | 'cache' | null;
}

export function MessageBubble({
  role,
  content,
  timestamp,
  responseSource = null,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-xl px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">
            {content}
          </p>
        </div>
        {/* Source badge for assistant messages */}
        {!isUser && responseSource && (
          <div className="mt-1 px-1">
            <span className={`text-[10px] font-medium inline-block px-2 py-0.5 rounded-full ${
              responseSource === 'llm' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'
            }`}>
              {responseSource === 'llm' ? 'LLM' : responseSource.toUpperCase()}
            </span>
          </div>
        )}
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 px-1">
            {timestamp}
          </span>
        )}
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}