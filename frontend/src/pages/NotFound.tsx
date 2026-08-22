// src/pages/NotFound.tsx
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Logo } from "../components/ui/Logo";
// @ts-expect-error
import ThemeToggle from "../components/ui/ThemeToggle";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white relative bg-[#FAFAFA] dark:bg-[#05050A] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans overflow-x-hidden">
      {/* Ambient Glow Header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none rounded-full hidden dark:block" />

      {/* Top Navigation Bar */}
      <nav className="w-full flex items-center justify-between px-6 sm:px-10 py-4 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#05050A]/80 backdrop-blur-2xl sticky top-0 z-50 transition-colors shadow-sm">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <Logo className="w-7 h-7" iconSize="w-3.5 h-3.5" />
          <span className="font-bold tracking-tight">
            Placify<span className="text-indigo-500">.</span>
          </span>
        </Link>
        <ThemeToggle />
      </nav>

      {/* Error Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 text-center">
        <div className="w-full max-w-md bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-900/5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>

          <span className="text-xs font-black tracking-widest text-indigo-500 uppercase bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/20">
            Error 404
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-4 mb-2">
            Page Not Found
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
            The operational slug or workspace route you are looking for does not
            exist or has been restricted.
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}