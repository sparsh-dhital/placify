// src/components/layout/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AIAssistant from "../ui/AIAssistant"; // Import the interactive chat window component

export default function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] dark:bg-[#05050A] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-500 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main
          className="flex-1 overflow-y-auto focus:outline-none p-6 sm:p-10"
          role="main"
          tabIndex={-1}
        >
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Replaced the static button with our fully functional Floating AI Assistant component */}
      <AIAssistant />
    </div>
  );
}