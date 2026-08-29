// src/components/layout/DashboardLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AIAssistant from "../ui/AIAssistant";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden bg-[#FAFAFA] dark:bg-[#05050A] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans">
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sticky sidebar */}
      <div className="hidden md:block md:sticky md:top-0 md:h-screen md:flex-shrink-0 z-30">
        <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-1 min-w-0 flex-col min-h-screen">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main
          className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 md:p-10"
          role="main"
          tabIndex={-1}
        >
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <AIAssistant />
    </div>
  );
}
