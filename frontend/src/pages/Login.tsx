import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "../components/ui/Logo";
// @ts-expect-error -- ThemeToggle is a JS module without TypeScript declarations
import ThemeToggle from "../components/ui/ThemeToggle";
import { cn } from "../utils/cn";
import { saveSession } from "../utils/session";

type Role = "ADMIN" | "STUDENT" | "PANELIST";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<Role>("ADMIN");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    saveSession(selectedRole, email);
    if (selectedRole === "ADMIN") navigate("/admin");
    if (selectedRole === "STUDENT") navigate("/student");
    if (selectedRole === "PANELIST") navigate("/panelist");
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center selection:bg-indigo-500 selection:text-white relative bg-[#F8FAFC] dark:bg-[#05050A] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans p-4 overflow-hidden"
      role="main"
    >
      {/* Ambient Backlighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-500/15 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none rounded-full hidden dark:block" />

      {/* Back to Home Button (Premium Pill Style) */}
      <Link
        to="/"
        className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full backdrop-blur-2xl hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-none shadow-sm z-20 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
        Home
      </Link>

      {/* Global Theme Toggle */}
      <div className="absolute top-5 right-5 sm:top-8 sm:right-8 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10 mt-12 sm:mt-0">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Logo className="w-12 h-12 mb-4 shadow-md" iconSize="w-6 h-6" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Sign in to the Placify Operations Console
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-[#0A0A12]/90 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Card Inner Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <form
            onSubmit={handleLogin}
            className="space-y-6 relative z-10"
            aria-label="Single Sign-On Form"
          >
            {/* Role Selection */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Select your role
              </legend>
              <div
                className="grid grid-cols-3 gap-3"
                role="radiogroup"
                aria-label="Role selection"
              >
                {(["ADMIN", "STUDENT", "PANELIST"] as Role[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    role="radio"
                    aria-checked={selectedRole === role}
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      "py-2.5 px-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all duration-200 cursor-none focus:outline-none focus:ring-2 focus:ring-indigo-500",
                      selectedRole === role
                        ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500/50 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10",
                    )}
                  >
                    {role === "ADMIN"
                      ? "Placement Officer"
                      : role.charAt(0) + role.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Email Input */}
            <div className="space-y-2 pt-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-900 dark:text-white"
              >
                Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-none shadow-sm"
                  aria-required="true"
                />
              </div>
            </div>

            {/* Relevant Security Badge */}
            <div className="flex items-center justify-center gap-2 mt-4 text-emerald-600 dark:text-emerald-400 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              Enterprise SSO Enforced
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 mt-4 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold rounded-2xl hover:scale-[1.01] active:scale-95 transition-all cursor-none shadow-xl shadow-indigo-600/25 group"
            >
              Continue with SSO
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-8">
          Secured by Placify Identity Infrastructure
        </p>
      </div>
    </main>
  );
}
