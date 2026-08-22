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
} from "lucide-react";
import {
  sendChatMessage,
  getChatHistory,
  deleteChatMessage,
  clearChatHistory,
} from "../../services/api";

interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      role: "assistant",
      content:
        "Hello! I am Placify Copilot. I assist exclusively with campus placement operations, eligibility matching, and career readiness. How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  // Fetch previous chat history from MongoDB when chat opens
  useEffect(() => {
    if (isOpen) {
      const fetchHistory = async () => {
        try {
          const userStr = localStorage.getItem("placify_user");
          const email = userStr
            ? JSON.parse(userStr).email
            : "demo@placify.com";
          const res = await getChatHistory(email);
          if (res.success && res.history.length > 0) {
            setMessages(
              res.history.map((h: any) => ({
                id: h.id,
                role: h.role,
                content: h.content,
                timestamp: new Date(h.timestamp),
              })),
            );
          }
        } catch (err) {
          console.error("Failed to load history from DB", err);
        }
      };
      fetchHistory();
    }
  }, [isOpen]);

  // Auto-scroll to bottom smoothly
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen, isFullscreen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const tempUserId = Date.now().toString();
    const newUserMessage: Message = {
      id: tempUserId,
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
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
      setMessages((prev) => [...prev, newAIMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ Connection Error: ${error.message || "Failed to reach backend analysis engine."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteChatMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  const handleDeleteAllHistory = async () => {
    if (
      !confirm(
        "Are you sure you want to permanently clear all chat history from the database?",
      )
    )
      return;
    try {
      const userStr = localStorage.getItem("placify_user");
      const email = userStr ? JSON.parse(userStr).email : "demo@placify.com";
      await clearChatHistory(email);

      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Chat history successfully purged from database memory. How can I help you with your next placement query?",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      alert("Failed to clear database memory.");
    }
  };

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/70 backdrop-blur-xl transition-all duration-500 ease-out"
          : "fixed bottom-6 right-6 z-50 flex flex-col items-end"
      }
    >
      {/* Chat Window Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Assistant Chat"
          aria-modal={isFullscreen}
          className={
            isFullscreen
              ? `${isDarkTheme ? "bg-[#0A0A12] text-white" : "bg-white text-slate-900"} w-full max-w-6xl h-[90vh] flex flex-col border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden transition-all duration-500 ease-out transform scale-100`
              : `${isDarkTheme ? "bg-[#0A0A12]/95 text-white" : "bg-white text-slate-900"} mb-4 w-[360px] sm:w-[420px] h-[520px] max-h-[calc(100vh-100px)] flex flex-col backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 overflow-hidden transition-all duration-300 ease-out origin-bottom-right`
          }
        >
          {/* Header */}
          <div
            className={`p-4 sm:px-6 border-b ${isDarkTheme ? "border-white/10 bg-[#05050A]/90" : "border-slate-200 bg-slate-50/90"} flex items-center justify-between shrink-0 transition-colors duration-300`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Bot className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  Placify Copilot{" "}
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </h3>
                <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
                  Placement Ops Only • Secure
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
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
                onClick={handleDeleteAllHistory}
                aria-label="Delete All Chat History"
                title="Clear all chat history"
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${isDarkTheme ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-50 text-red-600"}`}
              >
                <Trash2 className="w-4 h-4" />
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
                onClick={() => {
                  setIsOpen(false);
                  setIsFullscreen(false);
                }}
                aria-label="Close AI Assistant"
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${isDarkTheme ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-200 text-slate-600"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content Area (Sidebar with hover delete & Messages with perfect scrollbar) */}
          <div className="flex-1 flex overflow-hidden">
            {isFullscreen && (
              <aside
                className={`w-80 border-r ${isDarkTheme ? "border-white/10 bg-[#05050A]/50" : "border-slate-200 bg-slate-50"} p-6 hidden md:flex flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-indigo-500/40 [&::-webkit-scrollbar-thumb]:rounded-full`}
              >
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Saved Session History ({messages.length})
                </h4>
                <div className="space-y-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`group relative p-3 rounded-xl text-xs flex items-center justify-between gap-2 border transition-all ${
                        isDarkTheme
                          ? "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate flex-1 pr-6">{m.content}</span>
                      {/* Delete option appears on hover */}
                      <button
                        onClick={() => handleDeleteMessage(m.id)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 rounded-md shadow-md cursor-pointer"
                        title="Delete message from database"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </aside>
            )}

            {/* Messages Area with custom scrollbar */}
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-indigo-500/40 [&::-webkit-scrollbar-thumb]:rounded-full"
              role="log"
              aria-live="polite"
            >
              {messages.map((msg) => {
                const isAI = msg.role === "assistant";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-3 group ${isAI ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isAI
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {isAI ? (
                        <Bot className="w-3.5 h-3.5" />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="relative max-w-[80%] sm:max-w-[70%]">
                      <div
                        className={`px-4 py-3 text-sm leading-relaxed rounded-2xl shadow-sm whitespace-pre-line ${
                          isAI
                            ? isDarkTheme
                              ? "bg-[#05050A] text-slate-200 border border-white/5 rounded-bl-sm"
                              : "bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-sm"
                            : "bg-indigo-600 text-white rounded-br-sm shadow-md"
                        }`}
                      >
                        {msg.content}
                      </div>
                      {/* Hover delete button on message bubble */}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 rounded-full shadow-md cursor-pointer"
                        title="Delete message"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-end gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow-sm ${isDarkTheme ? "bg-[#05050A] border border-white/5" : "bg-slate-100 border border-slate-200"}`}
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
            </div>
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className={`p-4 border-t ${isDarkTheme ? "border-white/10 bg-[#05050A]/60" : "border-slate-200 bg-slate-50"} shrink-0`}
          >
            <div className="relative flex items-center max-w-4xl mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about placements, eligibility, or interview schedules..."
                aria-label="Type your placement query"
                className={`w-full pl-5 pr-14 py-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner ${
                  isDarkTheme
                    ? "bg-[#05050A] text-white border border-white/10 placeholder-slate-500"
                    : "bg-white text-slate-900 border border-slate-200 placeholder-slate-400"
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
      )}

      {/* Floating Action Button (FAB) */}
      {!isFullscreen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          className={`w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-4 ${
            isOpen
              ? "bg-slate-800 text-white hover:bg-slate-700"
              : "bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 shadow-indigo-500/25"
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