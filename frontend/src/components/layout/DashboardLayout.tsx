// src/components/layout/DashboardLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AIAssistant from "../ui/AIAssistant";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA] dark:bg-[#05050A] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans relative overflow-x-hidden">
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Drawer on mobile, fixed flex column on desktop) */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 transform md:translate-x-0 md:static transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main
          className="flex-1 focus:outline-none p-4 sm:p-6 md:p-10"
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