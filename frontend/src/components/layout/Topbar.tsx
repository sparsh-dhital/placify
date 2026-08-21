// src/components/layout/Topbar.tsx
import { Search, Bell, LogOut, Menu } from "lucide-react";
import { Link } from "react-router-dom";
// @ts-expect-error -- ThemeToggle is a JS component without TS declarations
import ThemeToggle from "../ui/ThemeToggle";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <header className="h-16 bg-white/80 dark:bg-[#0A0A12]/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3 w-full max-w-xs sm:max-w-md">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors md:hidden cursor-none"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates, drives, or agents..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative cursor-none"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
        </button>
        <ThemeToggle />
        <Link
          to="/login"
          className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-2 rounded-xl transition-all shadow-sm cursor-none whitespace-nowrap"
          aria-label="Sign out of admin account"
        >
          <LogOut className="w-4 h-4" />{" "}
          <span className="hidden xs:inline">Sign Out</span>
        </Link>
      </div>
    </header>
  );
}