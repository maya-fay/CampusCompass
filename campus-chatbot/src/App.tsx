import { TopBar } from "./components/TopBar";
import { PastChatsSidebar } from "./components/PastChatsSidebar";
import { MessageBubble } from "./components/MessageBubble";
import { ChatComposer } from "./components/ChatComposer";
import { ImageCard } from "./components/ImageCard";
import { MapPane } from "./components/MapPane";
import DirectionsCard from "./components/DirectionsCard";
import { ScrollArea } from "./components/ui/scroll-area";
import { useState, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  poi?: {
    lat: number;
    lng: number;
    name: string;
    description?: string;
  };
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

interface Location {
  lat: number;
  lng: number;
  name: string;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Where is the library?",
      timestamp: "2 hours ago",
      messages: [
        {
          id: "1-1",
          role: "user",
          content: "Where is the library?",
          timestamp: "10:30 AM",
        },
        {
          id: "1-2",
          role: "assistant",
          content:
            "The Main Library is located in the center of campus. It's a large, modern building with extensive study spaces and computer labs.",
          timestamp: "10:30 AM",
          poi: {
            lat: 18.0057,
            lng: -76.7473,
            name: "Main Library",
            description:
              "Central campus library with study areas",
          },
        },
      ],
    },
    {
      id: "2",
      title: "How do I get to the cafeteria?",
      timestamp: "Yesterday",
      messages: [],
    },
    {
      id: "3",
      title: "Where is the Student Union?",
      timestamp: "2 days ago",
      messages: [],
    },
  ]);
  const [currentSessionId, setCurrentSessionId] = useState<
    string | null
  >("1");
  const [isTyping, setIsTyping] = useState(false);

  const currentSession = sessions.find(
    (s) => s.id === currentSessionId,
  );
  const messages = currentSession?.messages || [];

  // Get the last assistant message with a POI
  const lastPOI = messages
    .slice()
    .reverse()
    .find((m) => m.role === "assistant" && m.poi)?.poi;

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    const scrollContainer = document.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (scrollContainer) {
      setTimeout(() => {
        scrollContainer.scrollTop =
          scrollContainer.scrollHeight;
      }, 100);
    }
  }, [messages]);

  const handleNewChat = () => {
    const newId = `${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New conversation",
      timestamp: "Just now",
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newId);
    setSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Add user message
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === currentSessionId) {
          const updatedMessages = [
            ...session.messages,
            userMessage,
          ];
          // Update session title if it's the first message
          const title =
            session.messages.length === 0
              ? content
              : session.title;
          return {
            ...session,
            messages: updatedMessages,
            title,
          };
        }
        return session;
      }),
    );

    // Simulate assistant response
    // Send the query to the backend API and use its response. If the API
    // call fails, fall back to the local generateResponse() function.
    setIsTyping(true);

    // API URL can be overridden at build/dev time with VITE_API_URL
    const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: content }),
      });

      const data: any = await res.json();

      let assistantContent = "";
      let poi = undefined;

      if (data && data.success) {
        assistantContent = data.response || generateResponse(content);

        // Try to extract a POI from building info if present
        if (data.building && data.building.latitude && data.building.longitude) {
          poi = {
            lat: Number(data.building.latitude),
            lng: Number(data.building.longitude),
            name: data.building.name,
            description: data.building.description,
          };
        } else if (data.pois && data.pois.length > 0) {
          // Prefer first POI if available
          const p = data.pois[0];
          if (p.latitude && p.longitude) {
            poi = {
              lat: Number(p.latitude),
              lng: Number(p.longitude),
              name: p.name,
              description: p.description,
            };
          }
        }
      } else {
        assistantContent = data && data.error
          ? `Sorry, I couldn't process that: ${data.error}`
          : generateResponse(content);
      }

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: assistantContent,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        poi: poi,
      };

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [...session.messages, assistantMessage],
            };
          }
          return session;
        }),
      );
    } catch (err) {
      // Network or other error - fallback to local response generator
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: generateResponse(content),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        poi: extractPOI(content),
      };

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [...session.messages, assistantMessage],
            };
          }
          return session;
        }),
      );
    } finally {
      setIsTyping(false);
    }
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("library")) {
      return "The Main Library is located in the center of campus. It's open Monday-Friday 8AM-10PM and weekends 10AM-6PM. The library features study rooms, computer labs, and a vast collection of books and journals.";
    } else if (
      lowerQuery.includes("cafeteria") ||
      lowerQuery.includes("food")
    ) {
      return "The main cafeteria is in the Student Center building. It offers a variety of meal options including local cuisine, international dishes, and vegetarian options. Operating hours are 7AM-8PM daily.";
    } else if (
      lowerQuery.includes("student union") ||
      lowerQuery.includes("student center")
    ) {
      return "The Student Union is located on the western side of campus. It houses the cafeteria, student organization offices, recreation areas, and meeting rooms. It's the hub of student life on campus.";
    } else if (
      lowerQuery.includes("gym") ||
      lowerQuery.includes("fitness")
    ) {
      return "The Sports & Fitness Center is located near the athletics field. It includes a fully equipped gym, basketball courts, and an Olympic-size swimming pool. Student memberships are available at the front desk.";
    } else if (lowerQuery.includes("parking")) {
      return "Main parking lots are located at the north and south entrances of campus. Student parking permits can be obtained from Campus Security. Visitor parking is available near the Administration building.";
    } else {
      return "I can help you navigate the UWI campus! You can ask me about building locations, facilities, operating hours, and directions. What would you like to know?";
    }
  };

  const extractPOI = (
    query: string,
  ):
    | {
        lat: number;
        lng: number;
        name: string;
        description?: string;
      }
    | undefined => {
    const lowerQuery = query.toLowerCase();

    // Sample POI coordinates (these would be real campus coordinates in production)
    if (lowerQuery.includes("library")) {
      return {
        lat: 18.0057,
        lng: -76.7473,
        name: "Main Library",
        description: "Central campus library",
      };
    } else if (
      lowerQuery.includes("cafeteria") ||
      lowerQuery.includes("student center") ||
      lowerQuery.includes("student union")
    ) {
      return {
        lat: 18.0065,
        lng: -76.7465,
        name: "Student Center",
        description: "Cafeteria and student services",
      };
    } else if (
      lowerQuery.includes("gym") ||
      lowerQuery.includes("fitness")
    ) {
      return {
        lat: 18.0048,
        lng: -76.748,
        name: "Sports & Fitness Center",
        description: "Gym and athletics facilities",
      };
    }

    return undefined;
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar */}
      <PastChatsSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Chat & Map Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
          {/* Map Pane and DirectionsCard - Desktop only, docked to right */}
          {lastPOI && (
            <div className="lg:hidden flex w-full border-t border-border">
              <div className="w-full lg:max-w-4xl lg:mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DirectionsCard
                  origin={null}
                  dest={{ name: lastPOI.name, coords: { lat: lastPOI.lat, lng: lastPOI.lng } }}
                  mode="walking"
                  notes={lastPOI.description ? [lastPOI.description] : []}
                />
                <div className="flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-base text-foreground">
                      Location
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {lastPOI.name}
                    </p>
                  </div>
                  <MapPane
                    poi={lastPOI}
                    className="h-[50vh] w-full"
                  />
                </div>
              </div>
            </div>
          </div>
      )}
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <h2 className="text-2xl text-foreground mb-2">
                      Welcome to UWI Navigator
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Ask me anything about campus locations,
                      buildings, facilities, and services. I'm
                      here to help you navigate!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 w-full lg:max-w-4xl lg:mx-auto">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <MessageBubble
                        role={message.role}
                        content={message.content}
                        timestamp={message.timestamp}
                      />
                      {message.image && (
                        <div className="mt-3 ml-11">
                          <ImageCard {...message.image} />
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <MessageBubble
                      role="assistant"
                      content="Typing..."
                      timestamp=""
                    />
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Map under messages on desktop only */}
            {/* {lastPOI && (
              <div className="hidden lg:block border-t border-border">
                <div className="p-4">
                  <h3 className="text-sm text-foreground mb-2">
                    Location
                  </h3>
                  
                  <MapPane
                    poi={lastPOI}
                    className="h-[50vh]"
                  />
                </div>
              </div> */}
            {/* )} */}

            {/* Chat Composer */}
            <ChatComposer
              onSend={handleSendMessage}
              disabled={isTyping}
            />
          </div>

          {/* Map Pane and DirectionsCard - Desktop only, docked to right */}
          {lastPOI && (
            <div className="hidden lg:flex w-[800px] border-l border-border p-4 gap-4">
              <div className="flex-1 flex flex-col">
                <div className="flex-1">
                <DirectionsCard
                  origin={null}
                  dest={{ name: lastPOI.name, coords: { lat: lastPOI.lat, lng: lastPOI.lng } }}
                  mode="walking"
                  notes={lastPOI.description ? [lastPOI.description] : []}
                />
              </div>
                <MapPane
                  poi={lastPOI}
                  className="flex-1 min-h-[60vh]"
                  onLocationChange={(location) => {
                    if (location) {
                      setUserLocation(location);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}