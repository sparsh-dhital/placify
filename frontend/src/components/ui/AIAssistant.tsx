// src/components/ui/AIAssistant.tsx
import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, User } from "lucide-react";

interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      role: "assistant",
      content:
        "Hello! I am Placify's AI Copilot. I can help you analyze job descriptions, explain match scores, or resolve scheduling conflicts. What do you need help with today?",
      timestamp: new Date(),
    },
  ]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Mock AI Response Delay
    setTimeout(() => {
      const newAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I've noted your request. Once the backend integration is live, I will be able to directly query the database and assist you with real-time placement operations!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newAIMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Assistant Chat"
          aria-modal="false"
          className="mb-4 w-[350px] sm:w-[400px] h-[500px] max-h-[calc(100vh-100px)] flex flex-col bg-white dark:bg-[#0A0A12]/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl shadow-indigo-500/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 origin-bottom-right"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#05050A]/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
                <Bot
                  className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Placify Copilot{" "}
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </h3>
                <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Assistant"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors cursor-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            role="log"
            aria-live="polite"
          >
            {messages.map((msg) => {
              const isAI = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isAI ? "flex-row" : "flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      isAI
                        ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30"
                        : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {isAI ? (
                      <Bot className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 text-sm rounded-2xl ${
                      isAI
                        ? "bg-slate-50 dark:bg-[#05050A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 rounded-bl-sm"
                        : "bg-indigo-600 text-white shadow-md rounded-br-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-500/30">
                  <Bot className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="px-4 py-3 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5 rounded-2xl rounded-bl-sm flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-transparent shrink-0"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Placify AI..."
                aria-label="Type your message"
                className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-none"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                aria-label="Send message"
                className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors cursor-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#0A0A12]"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        className={`w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 cursor-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-4 dark:focus:ring-offset-[#0A0A12] ${
          isOpen
            ? "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20"
            : "bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 shadow-indigo-500/25"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}