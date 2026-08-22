import { useState, useRef, useEffect } from "react";
import { X, Send, BrainCircuit, Sparkles } from "lucide-react";
import { cn } from "../../utils/cn";
import { sendChatMessage } from "../../services/api";

export function AICritic() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [chatHistory, setChatHistory] = useState([
    {
      sender: "ai",
      text: "I am your Placify AI Critic. I constantly analyze your database states and workflows. Ask me for an analysis.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userText = message;
    setMessage("");
    setChatHistory((prev) => [...prev, { sender: "user", text: userText }]);
    setIsTyping(true);

    try {
      const userStr = localStorage.getItem("placify_user");
      const role = userStr ? JSON.parse(userStr).role : "student";
      const email = userStr ? JSON.parse(userStr).email : "demo@placify.com";

      const data = await sendChatMessage(email, role, userText);

      setTimeout(() => {
        setChatHistory((prev) => [...prev, { sender: "ai", text: data.reply }]);
        setIsTyping(false);
      }, 800);
    } catch (error: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `⚠️ DEBUG ERROR: ${error.message || "Unknown error occurred"}`,
        },
      ]);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="ai-critic-title"
          data-lenis-prevent
          className="mb-4 w-[360px] sm:w-[420px] h-[520px] max-h-[calc(100vh-100px)] flex flex-col bg-white/90 dark:bg-[#0A0A12]/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl shadow-indigo-500/10 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300"
        >
          {/* Header */}
          <header className="p-4 sm:px-6 border-b border-white/10 bg-[#05050A]/90 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-200" />
              <div>
                <h2
                  id="ai-critic-title"
                  className="text-sm font-bold tracking-tight"
                >
                  Placify AI Critic
                </h2>
                <p className="text-[10px] text-indigo-200 uppercase tracking-wider font-semibold">
                  Live DB Analysis Active
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Messages Area */}
          <section
            className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth overscroll-contain"
            role="log"
            aria-live="polite"
            aria-busy={isTyping}
            aria-label="Conversation messages"
          >
            {chatHistory.map((chat, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex w-full",
                  chat.sender === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                    chat.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-white/5",
                  )}
                >
                  {chat.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start w-full">
                <div
                  role="status"
                  aria-label="Assistant is typing"
                  className="bg-slate-100 dark:bg-white/10 p-4 rounded-2xl rounded-bl-none border border-slate-200 dark:border-white/5 flex gap-1"
                >
                  <span
                    className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </section>

          {/* Input Area */}
          <footer className="shrink-0 p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask for an analysis..."
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={!message.trim() || isTyping}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </footer>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer border-2",
          isOpen
            ? "bg-slate-800 border-slate-700 text-white rotate-90"
            : "bg-indigo-600 border-indigo-400 text-white hover:scale-110 hover:shadow-indigo-500/50",
        )}
        aria-label="Toggle AI Critic"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>
    </div>
  );
}
