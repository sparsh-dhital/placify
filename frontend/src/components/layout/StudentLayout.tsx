// src/components/layout/StudentLayout.tsx
import { Outlet, Link } from "react-router-dom";
import { Logo } from "../ui/Logo";
// @ts-expect-error -- ThemeToggle is a JS component without TS declarations
import ThemeToggle from "../ui/ThemeToggle";
import AIAssistant from "../ui/AIAssistant";
import { LogOut, ShieldCheck } from "lucide-react";

export default function StudentLayout() {
  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA] dark:bg-[#05050A] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans flex-col">
      <header className="h-16 bg-white/80 dark:bg-[#0A0A12]/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 sm:px-10 flex-shrink-0 sticky top-0 z-40">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg no-underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Go to Placify Home"
        >
          <Logo className="w-8 h-8 shadow-sm" iconSize="w-4 h-4" />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Placify
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-500/20">
              Student Portal
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
          </div>
          <ThemeToggle />
          {/* Stylish Premium Red Sign Out Button */}
          <Link
            to="/login"
            className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-none"
            aria-label="Sign out of student account"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
        </div>
      </header>

      <main
        className="flex-1 p-6 sm:p-10 focus:outline-none"
        role="main"
        tabIndex={-1}
      >
        <div className="max-w-6xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
