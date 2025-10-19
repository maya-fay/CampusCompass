import { useState } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
}

interface PastChatsSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function PastChatsSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  isOpen = true,
  onClose,
}: PastChatsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter((session) =>
    session.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg text-foreground">Chats</h2>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
          <Button
            onClick={onNewChat}
            className="w-full gap-2 rounded-lg"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-input-background"
            />
          </div>
        </div>

        {/* Chat Sessions List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors hover:bg-secondary ${
                    currentSessionId === session.id
                      ? "bg-secondary"
                      : "bg-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.timestamp}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No chats found"
                    : "No chat history yet"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}