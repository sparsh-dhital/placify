import { Outlet } from "react-router-dom";
import { Bot } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-[#080B12] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main
          className="flex-1 overflow-y-auto focus:outline-none p-8"
          role="main"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>

      {/* Global Floating AI Assistant Button */}
      <button
        className="fixed bottom-6 right-6 p-3.5 rounded-full bg-accent-primary text-white shadow-premium hover:bg-accent-secondary hover:scale-105 active:scale-95 transition-all duration-200 z-50 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080B12] focus:ring-accent-primary group"
        aria-label="Open Placement AI Assistant"
      >
        <Bot className="w-5 h-5" aria-hidden="true" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2 text-sm font-medium">
          Ask Placify AI
        </span>
      </button>
    </div>
  );
}