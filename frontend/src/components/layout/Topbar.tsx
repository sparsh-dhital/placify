import { Search, Bell, User } from "lucide-react";
// @ts-expect-error -- ThemeToggle is a JS component without TS declarations
import ThemeToggle from "../ui/ThemeToggle";
import type { SessionUser } from "../../utils/session";

export default function Topbar({ session }: { session: SessionUser | null }) {
  const roleLabel =
    session?.role === "ADMIN"
      ? "Placement Officer"
      : session?.role === "PANELIST"
        ? "Panelist"
        : "Student";

  return (
    <header
      className="h-16 bg-white/80 dark:bg-[#0A0A12]/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-8 flex-shrink-0 transition-colors"
      aria-label="Top Navigation"
    >
      <div className="flex-1 flex items-center">
        <div className="relative w-64 max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            placeholder="Search placements, candidates..."
            className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            aria-label="Global search"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
          <span
            className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
            aria-hidden="true"
          ></span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {roleLabel} · 2026 Drive Active
          </span>
        </div>

        <button
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 relative"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 border border-white dark:border-[#0A0A12]"></span>
        </button>

        <button
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="User profile menu"
        >
          <User className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
