// src/components/ui/AIAssistant.tsx
import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  User,
  Maximize2,
  Minimize2,
  Trash2,
  Sun,
  Moon,
  Plus,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  sendChatMessage,
  getChatHistory,
  deleteChatMessage,
} from "../../services/api";

interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Lock background scrolling when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.setProperty("overflow", "hidden", "important");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Fetch and group history into sessions
  useEffect(() => {
    if (isOpen && sessions.length === 0) {
      const fetchHistory = async () => {
        try {
          const userStr = localStorage.getItem("placify_user");
          const email = userStr
            ? JSON.parse(userStr).email
            : "demo@placify.com";
          const res = await getChatHistory(email);

          if (res.success && res.history.length > 0) {
            const groupedSessions: ChatSession[] = [];
            let currentSession: ChatSession | null = null;

            res.history.forEach((msg: any, index: number) => {
              const msgDate = new Date(msg.timestamp);
              const prevMsg = index > 0 ? res.history[index - 1] : null;
              const prevDate = prevMsg ? new Date(prevMsg.timestamp) : null;

              if (
                !currentSession ||
                (prevDate &&
                  msgDate.getTime() - prevDate.getTime() > 30 * 60 * 1000)
              ) {
                if (currentSession) groupedSessions.unshift(currentSession);
                currentSession = {
                  id: msg.id,
                  title:
                    msg.role === "user"
                      ? msg.content.substring(0, 25) + "..."
                      : "Placement Query",
                  messages: [],
                };
              }
              currentSession.messages.push({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: msgDate,
              });
              if (
                msg.role === "user" &&
                currentSession.title === "Placement Query"
              ) {
                currentSession.title = msg.content.substring(0, 25) + "...";
              }
            });
            if (currentSession) groupedSessions.unshift(currentSession);

            setSessions(groupedSessions);
            setActiveSessionId(groupedSessions[0].id);
          } else {
            startNewChat();
          }
        } catch (err) {
          console.error("Failed to load history from DB", err);
          startNewChat();
        }
      };
      fetchHistory();
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sessions, activeSessionId, isTyping, isOpen, isFullscreen]);

  const activeMessages =
    sessions.find((s) => s.id === activeSessionId)?.messages || [];

  const startNewChat = () => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Conversation",
      messages: [
        {
          id: `msg_${newSessionId}`,
          role: "assistant",
          content:
            "Hello! I am Placify Copilot. I assist exclusively with campus placement operations, eligibility matching, and career readiness. How can I help you today?",
          timestamp: new Date(),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeSessionId) return;

    const userText = inputValue;
    const tempUserId = Date.now().toString();
    const newUserMessage: Message = {
      id: tempUserId,
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title:
              s.title === "New Conversation"
                ? userText.substring(0, 25) + "..."
                : s.title,
            messages: [...s.messages, newUserMessage],
          };
        }
        return s;
      }),
    );

    setInputValue("");
    setIsTyping(true);

    try {
      const userStr = localStorage.getItem("placify_user");
      const role = userStr ? JSON.parse(userStr).role : "student";
      const email = userStr ? JSON.parse(userStr).email : "demo@placify.com";

      const data = await sendChatMessage(email, role, userText);

      const newAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, newAIMessage] }
            : s,
        ),
      );
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ Connection Error: ${error.message || "Failed to reach backend."}`,
        timestamp: new Date(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, errorMessage] }
            : s,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteSession = async (
    e: React.MouseEvent,
    sessionId: string,
  ) => {
    e.stopPropagation();
    if (
      !confirm("Are you sure you want to permanently delete this conversation?")
    )
      return;

    const sessionToDelete = sessions.find((s) => s.id === sessionId);
    if (!sessionToDelete) return;

    const updatedSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(updatedSessions);

    if (activeSessionId === sessionId) {
      if (updatedSessions.length > 0) setActiveSessionId(updatedSessions[0].id);
      else startNewChat();
    }

    try {
      await Promise.all(
        sessionToDelete.messages.map((m) => {
          if (m.id.length === 24) return deleteChatMessage(m.id);
          return Promise.resolve();
        }),
      );
    } catch (error) {
      console.error("Failed to delete some messages from database memory.");
    }
  };

  const closeAssistant = () => {
    setIsOpen(false);
    setIsFullscreen(false);
  };

  return (
    <div
      className={
        isOpen && isFullscreen
          ? "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/70 backdrop-blur-xl transition-all duration-500 ease-out"
          : "fixed bottom-6 right-6 z-50 flex flex-col items-end"
      }
    >
      {/* Chat Window Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="ai-assistant-title"
          aria-modal={isFullscreen}
          data-lenis-prevent
          className={
            isFullscreen
              ? `${isDarkTheme ? "bg-[#0A0A12]/90 text-white border-white/10 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" : "bg-white/90 text-slate-900 border-white/80 shadow-[0_24px_100px_rgba(15,23,42,0.28)]"} w-full max-w-6xl h-[90vh] flex flex-col backdrop-blur-2xl border rounded-[2.5rem] ring-1 ring-white/10 overflow-hidden transition-all duration-500 ease-out transform scale-100`
              : `${isDarkTheme ? "bg-[#0A0A12]/95 text-white border-white/10" : "bg-white text-slate-900 border-slate-200"} mb-4 w-[360px] sm:w-[420px] h-[520px] max-h-[calc(100vh-100px)] flex flex-col backdrop-blur-3xl border rounded-[2rem] shadow-2xl shadow-indigo-500/10 overflow-hidden transition-all duration-300 ease-out origin-bottom-right`
          }
        >
          {/* Header */}
          <header
            className={`p-4 sm:px-6 border-b ${isDarkTheme ? "border-white/10 bg-[#05050A]/90" : "border-slate-200 bg-slate-50/90"} flex items-center justify-between shrink-0 transition-colors duration-300 z-10`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0">
                <Bot className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="ai-assistant-title"
                  className="text-sm font-bold flex items-center gap-1.5"
                >
                  Placify Copilot{" "}
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </h2>
                <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
                  Placement Ops Only • Secure
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                aria-label="Toggle Theme"
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${isDarkTheme ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-200 text-slate-600"}`}
              >
                {isDarkTheme ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                aria-label={
                  isFullscreen ? "Minimize chat" : "Expand to fullscreen"
                }
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${isDarkTheme ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-200 text-slate-600"}`}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={closeAssistant}
                aria-label="Close AI Assistant"
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${isDarkTheme ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-200 text-slate-600"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main Layout Container - PURE FLEXBOX FOR FLAWLESS SCROLLING */}
          <div
            className={`flex-1 flex overflow-hidden min-h-0 ${isDarkTheme ? "bg-[#0A0A12]" : "bg-slate-50"}`}
          >
            {/* Left Sidebar (Only visible in Fullscreen) */}
            {isFullscreen && (
              <aside
                className={`w-72 shrink-0 border-r ${isDarkTheme ? "border-white/10 bg-[#05050A]/60" : "border-slate-200 bg-slate-100/50"} p-5 hidden md:flex flex-col gap-4 overflow-hidden`}
              >
                <button
                  onClick={startNewChat}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-indigo-500/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1 mt-2">
                    Your Conversations
                  </h4>
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => setActiveSessionId(session.id)}
                      className={`group relative p-3.5 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-all border ${
                        activeSessionId === session.id
                          ? isDarkTheme
                            ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                            : "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : isDarkTheme
                            ? "bg-transparent border-transparent text-slate-400 hover:bg-white/5"
                            : "bg-transparent border-transparent text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span className="truncate pr-6">{session.title}</span>

                      {/* Delete Conversation Button (Hover) */}
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-md cursor-pointer"
                        title="Delete conversation completely"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </aside>
            )}

            {/* Right Chat Column - STRICT STANDARD FLEX COLUMN */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden">
              {/* Messages Scroll Area - No more absolute positioning */}
              <section
                className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth overscroll-contain [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${isDarkTheme ? "[&::-webkit-scrollbar-thumb]:bg-slate-700/50 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600" : "[&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400"}`}
                role="log"
                aria-live="polite"
                aria-busy={isTyping}
                aria-label="Conversation messages"
              >
                {activeMessages.map((msg) => {
                  const isAI = msg.role === "assistant";
                  // Pre-process message to replace raw HTML <br> tags with markdown newlines
                  const processedContent = msg.content.replace(
                    /<br\s*\/?>/gi,
                    "\n",
                  );

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-3 ${isAI ? "flex-row" : "flex-row-reverse"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isAI
                            ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            : "bg-slate-500/20 text-slate-300"
                        }`}
                      >
                        {isAI ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>

                      <div className="relative max-w-[95%] sm:max-w-[85%]">
                        <div
                          className={`px-5 py-4 text-sm leading-relaxed rounded-[1.25rem] shadow-sm ${
                            isAI
                              ? isDarkTheme
                                ? "bg-[#05050A]/80 text-slate-200 border border-white/5 rounded-bl-sm"
                                : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                              : "bg-indigo-600 text-white rounded-br-sm shadow-md"
                          }`}
                        >
                          {isAI ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // Custom Tailwind rendering for beautifully themed markdown tables
                                table: ({ node, ...props }) => (
                                  <div
                                    className={`overflow-x-auto my-4 rounded-xl border shadow-sm ${isDarkTheme ? "border-slate-700/50 bg-slate-800/40" : "border-slate-200 bg-white"}`}
                                  >
                                    <table
                                      className={`min-w-full divide-y ${isDarkTheme ? "divide-slate-700/50" : "divide-slate-200"}`}
                                      {...props}
                                    />
                                  </div>
                                ),
                                thead: ({ node, ...props }) => (
                                  <thead
                                    className={
                                      isDarkTheme
                                        ? "bg-slate-800/80"
                                        : "bg-slate-50"
                                    }
                                    {...props}
                                  />
                                ),
                                th: ({ node, ...props }) => (
                                  <th
                                    className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkTheme ? "text-slate-300" : "text-slate-700"}`}
                                    {...props}
                                  />
                                ),
                                td: ({ node, ...props }) => (
                                  <td
                                    className={`px-4 py-3.5 text-sm border-t whitespace-pre-wrap ${isDarkTheme ? "text-slate-300 border-slate-700/50" : "text-slate-700 border-slate-200"}`}
                                    {...props}
                                  />
                                ),
                                p: ({ node, ...props }) => (
                                  <p className="mb-3 last:mb-0" {...props} />
                                ),
                                ul: ({ node, ...props }) => (
                                  <ul
                                    className="list-disc pl-5 mb-3 space-y-1.5 marker:text-indigo-500"
                                    {...props}
                                  />
                                ),
                                ol: ({ node, ...props }) => (
                                  <ol
                                    className="list-decimal pl-5 mb-3 space-y-1.5 marker:text-indigo-500"
                                    {...props}
                                  />
                                ),
                                strong: ({ node, ...props }) => (
                                  <strong
                                    className={
                                      isDarkTheme
                                        ? "font-bold text-indigo-400"
                                        : "font-bold text-indigo-700"
                                    }
                                    {...props}
                                  />
                                ),
                                a: ({ node, ...props }) => (
                                  <a
                                    className={`${isDarkTheme ? "text-indigo-400" : "text-indigo-600"} hover:underline`}
                                    {...props}
                                  />
                                ),
                              }}
                            >
                              {processedContent}
                            </ReactMarkdown>
                          ) : (
                            <p className="whitespace-pre-line">
                              {processedContent}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-end gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div
                      role="status"
                      aria-label="Assistant is typing"
                      className={`px-5 py-4 rounded-[1.25rem] rounded-bl-sm flex items-center gap-1.5 shadow-sm ${isDarkTheme ? "bg-[#05050A]/80 border border-white/5" : "bg-white border border-slate-200"}`}
                    >
                      <div
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </section>

              {/* Input Area - Flex Shrink keeps it perfectly fixed at the bottom */}
              <form
                onSubmit={handleSendMessage}
                className={`shrink-0 p-4 sm:p-5 border-t ${isDarkTheme ? "border-white/10 bg-[#0A0A12]/95 backdrop-blur-md" : "border-slate-200 bg-white/95 backdrop-blur-md"}`}
              >
                <div className="relative flex items-center w-full">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about placements, eligibility, or interview schedules..."
                    aria-label="Type your placement query"
                    className={`w-full pl-5 pr-14 py-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner ${
                      isDarkTheme
                        ? "bg-[#05050A] text-white border border-white/10 placeholder-slate-500"
                        : "bg-slate-50 text-slate-900 border border-slate-200 placeholder-slate-400"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    aria-label="Send message"
                    className="absolute right-2 w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      {!isFullscreen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          className={`w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-4 ${
            isOpen
              ? "bg-slate-800 text-white hover:bg-slate-700 dark:focus:ring-offset-[#0A0A12]"
              : "bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 shadow-indigo-500/25 dark:focus:ring-offset-[#0A0A12]"
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </button>
      )}
    </div>
  );
}
