// src/pages/Landing.tsx
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  ShieldAlert,
  Users,
  Terminal,
  Mail,
  MessageSquare,
  User,
  Send,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
// @ts-expect-error -- ThemeToggle is implemented in JSX without a TS declaration file.
import ThemeToggle from "../components/ui/ThemeToggle";
import { Logo } from "../components/ui/Logo";

export default function Landing() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white relative bg-[#F8FAFC] dark:bg-[#05050A] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans overflow-x-hidden">
      {/* Ambient Backlighting (Dark Mode Only) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none rounded-full hidden dark:block" />

      {/* Sticky Navbar */}
      <nav
        className="w-full flex items-center justify-between px-5 sm:px-10 py-4 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#05050A]/80 backdrop-blur-2xl sticky top-0 z-50 transition-colors shadow-sm"
        aria-label="Main Navigation"
      >
        <div className="flex items-center gap-3">
          <Logo
            className="w-8 h-8 sm:w-9 sm:h-9 shadow-md"
            iconSize="w-4 h-4 sm:w-5 sm:h-5"
          />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Placify<span className="text-indigo-500">.</span>
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <ThemeToggle />
          <Link
            to="/login"
            className="group relative inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/25 shrink-0 whitespace-nowrap cursor-none"
          >
            <span className="relative flex items-center gap-1.5">
              Get Started{" "}
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full overflow-hidden px-6">
        <div className="max-w-6xl mx-auto pt-20 sm:pt-28 pb-12 sm:pb-16 text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-6 sm:mb-8 rounded-full border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-indigo-500/10 backdrop-blur-xl text-xs font-semibold tracking-wide text-indigo-400 dark:text-cyan-300 uppercase shadow-lg shadow-indigo-500/10 cursor-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            AI Placement Engine • v2.0 Active
          </div>

          <h1 className="max-w-5xl text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-6 sm:mb-8">
            Campus Placements, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-400">
              Mathematically Optimized.
            </span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            Leave the spreadsheets behind. Placify intelligently extracts JD
            constraints, maps skill gaps in real-time, and autonomously routes
            live interview schedules.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative z-10 w-full">
        {/* Bento Grid */}
        <section className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 lg:auto-rows-[320px] gap-6 text-left mb-20 sm:mb-28">
          {/* Card 1: JD Extraction */}
          <div className="lg:col-span-2 lg:row-span-1 bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col lg:flex-row gap-6 lg:gap-8 justify-between group hover:border-indigo-500/50 transition-all duration-500 shadow-xl shadow-slate-900/5 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-colors" />

            <div className="flex-1 flex flex-col justify-center z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                Deterministic Extraction
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Upload a company PDF. Our orchestrator extracts hard criteria
                and maps them against student registers with 100%
                explainability.
              </p>
            </div>

            <div className="flex-1 bg-slate-900 dark:bg-[#05050A] rounded-2xl border border-slate-800 dark:border-white/10 p-4 sm:p-5 font-mono text-[11px] sm:text-xs shadow-md flex flex-col z-10 relative overflow-hidden group-hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 border-b border-slate-800 text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>agent_extractor.py</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <p>
                  <span className="text-indigo-400">Analyzing</span>{" "}
                  <span className="text-white">TechNova_SDE.pdf</span>...
                </p>
                <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Constraints verified
                  successfully
                </p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300 pl-3 border-l-2 border-indigo-500/40 mt-3 text-cyan-300">
                  <p>{`{`}</p>
                  <p className="pl-4">
                    "min_cgpa": <span className="text-amber-400">7.5</span>,
                  </p>
                  <p className="pl-4">
                    "req_skills": [
                    <span className="text-emerald-300">"React"</span>,{" "}
                    <span className="text-emerald-300">"Node"</span>],
                  </p>
                  <p className="pl-4">
                    "backlogs": <span className="text-amber-400">0</span>
                  </p>
                  <p>{`}`}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Skill Analytics */}
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col justify-between gap-6 group hover:border-cyan-500/50 transition-all duration-500 shadow-xl shadow-slate-900/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 sm:p-8 z-10">
              <span className="text-[10px] sm:text-xs font-mono font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 sm:px-3 py-1 rounded-full shadow-sm">
                94% MATCH
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-end z-10 pt-6">
              <div className="space-y-3 sm:space-y-4 w-full">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span>System Architecture</span>
                    <span className="text-slate-900 dark:text-white font-mono">
                      82%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/5">
                    <div className="h-full bg-cyan-400 w-0 group-hover:w-[82%] transition-all duration-1000 ease-out rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span>Full-Stack Mastery</span>
                    <span className="text-slate-900 dark:text-white font-mono">
                      95%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/5">
                    <div className="h-full bg-indigo-500 w-0 group-hover:w-[95%] transition-all duration-1000 delay-150 ease-out rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="z-10 mt-4">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Readiness Analytics
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                AI-verified student skill gap mapping.
              </p>
            </div>
          </div>

          {/* Card 3: Exception Center */}
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col justify-between gap-6 group hover:border-amber-500/50 transition-all duration-500 shadow-xl shadow-slate-900/5 relative overflow-hidden">
            <div className="flex-1 flex items-center justify-center z-10 py-2">
              <div className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm">
                <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-amber-400 animate-pulse shrink-0 shadow-sm shadow-amber-400/50" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Room A Schedule Conflict
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Schedule agent automatically rerouting 2 candidates to Room
                    B.
                  </p>
                </div>
              </div>
            </div>

            <div className="z-10 mt-4">
              <div className="flex items-center gap-2.5 mb-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Chaos Prevention
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Real-time detection of panel overlaps.
              </p>
            </div>
          </div>

          {/* Card 4: Human Control */}
          <div className="lg:col-span-2 lg:row-span-1 bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col lg:flex-row gap-6 lg:gap-8 justify-between group hover:border-purple-500/50 transition-all duration-500 shadow-xl shadow-slate-900/5 overflow-hidden relative">
            <div className="flex-1 flex flex-col justify-center z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:rotate-6 transition-transform duration-300">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                Human-in-the-Loop Control
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                AI proposes optimized schedules and rosters. The Placement
                Officer maintains absolute executive approval.
              </p>
            </div>

            <div className="flex-1 flex items-center justify-end z-10">
              <div className="bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-md w-full max-w-xs transform group-hover:scale-105 transition-transform duration-500 ease-out">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Approve Shortlist?
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                    41 Ready
                  </span>
                </div>
                <div className="flex gap-2.5">
                  <div className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-none">
                    Review
                  </div>
                  <div className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-xs font-semibold text-white shadow-md cursor-none">
                    Approve
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="w-full max-w-3xl text-left relative z-10 mb-12 px-2 sm:px-0">
          <div className="bg-white dark:bg-[#0A0A12]/90 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-12 md:p-14 shadow-xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-xs font-semibold mb-3 sm:mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Enterprise Concierge
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2 sm:mb-3">
                Need Integration Support?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base px-2">
                Connect directly with our engineering team to schedule a
                technical deployment for your university.
              </p>
            </div>

            <form
              className="space-y-4 sm:space-y-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-none shadow-sm"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="University Email"
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-none shadow-sm"
                  />
                </div>
              </div>
              <div className="relative">
                <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  rows={4}
                  placeholder="How can we help your placement cell?"
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none cursor-none shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold rounded-2xl hover:scale-[1.01] active:scale-95 transition-all cursor-none shadow-xl shadow-indigo-600/25"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-[#05050A] border-t border-slate-200 dark:border-white/10 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" iconSize="w-3.5 h-3.5" />
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Placify<span className="text-indigo-500">.</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <a
              href="#"
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-none"
            >
              System Status
            </a>
            <a
              href="#"
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-none"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-none"
            >
              Terms of Service
            </a>
          </div>

          <div className="text-xs sm:text-sm font-mono text-slate-400 dark:text-slate-500">
            &copy; {currentYear} Placify Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}