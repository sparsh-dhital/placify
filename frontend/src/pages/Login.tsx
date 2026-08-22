// src/pages/Login.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Lock,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { Logo } from "../components/ui/Logo";
// @ts-expect-error
import ThemeToggle from "../components/ui/ThemeToggle";
import { cn } from "../utils/cn";
import { loginUser, requestOtpLogin, verifyOtpLogin } from "../services/api";

type Role = "ADMIN" | "STUDENT" | "PANELIST";
type LoginMethod = "PASSWORD" | "OTP";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<Role>("ADMIN");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("PASSWORD");

  const [email, setEmail] = useState("admin@placify.com");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isTypingOtp, setIsTypingOtp] = useState(false); // New state to disable button during animation

  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedRole === "ADMIN") setEmail("admin@placify.com");
    if (selectedRole === "STUDENT") setEmail("student@placify.com");
    if (selectedRole === "PANELIST") setEmail("panelist@placify.com");

    setPassword("");
    setOtpCode("");
    setOtpSent(false);
    setIsTypingOtp(false);
    setStatus("idle");
    setErrorMessage("");
  }, [selectedRole, loginMethod]);

  const handleRouteSuccess = (data: any) => {
    localStorage.setItem("placify_token", data.access_token);
    localStorage.setItem("placify_user", JSON.stringify(data.user));
    setStatus("success");
    setTimeout(() => {
      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "panelist") navigate("/panelist");
      else navigate("/student");
    }, 800);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      if (loginMethod === "PASSWORD") {
        const data = await loginUser({ email, password });
        handleRouteSuccess(data);
      } else if (loginMethod === "OTP" && !otpSent) {
        // Step 1: Request OTP
        const response = await requestOtpLogin(email);
        setOtpSent(true);
        setStatus("idle");

        // Auto-fill the mock OTP with a realistic typing animation
        if (response.mock_otp) {
          setIsTypingOtp(true);
          setOtpCode(""); // Ensure it starts empty

          // Wait 600ms to simulate the "email arriving"
          setTimeout(() => {
            let currentIndex = 0;
            const otpString = String(response.mock_otp);

            // Type one character every 150ms
            const typingInterval = setInterval(() => {
              if (currentIndex <= otpString.length) {
                setOtpCode(otpString.slice(0, currentIndex));
                currentIndex++;
              } else {
                clearInterval(typingInterval);
                setIsTypingOtp(false); // Typing finished, allow submit
              }
            }, 150);
          }, 600);
        }
      } else if (loginMethod === "OTP" && otpSent) {
        // Step 2: Verify OTP
        const data = await verifyOtpLogin(email, otpCode);
        handleRouteSuccess(data);
      }
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center selection:bg-indigo-500 selection:text-white relative bg-[#F8FAFC] dark:bg-[#05050A] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans p-4 overflow-hidden"
      role="main"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-500/15 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none rounded-full hidden dark:block" />

      <Link
        to="/"
        className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full backdrop-blur-2xl hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all duration-300 cursor-pointer shadow-sm z-20 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
        Home
      </Link>

      <div className="absolute top-5 right-5 sm:top-8 sm:right-8 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10 mt-12 sm:mt-0">
        <div className="flex flex-col items-center mb-8 text-center">
          <Logo className="w-12 h-12 mb-4 shadow-md" iconSize="w-6 h-6" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Sign in to the Placify Operations Console
          </p>
        </div>

        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {/* Hides profile selection when OTP is sent for cleaner UI */}
            {!otpSent && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Select profile
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {(["ADMIN", "STUDENT", "PANELIST"] as Role[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        "py-2.5 px-2 text-[11px] sm:text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500",
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
            )}

            <div className="space-y-4 pt-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm disabled:opacity-60"
                  disabled={
                    otpSent || status === "loading" || status === "success"
                  }
                />
              </div>

              {loginMethod === "PASSWORD" && (
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    disabled={status === "loading" || status === "success"}
                  />
                </div>
              )}

              {loginMethod === "OTP" && otpSent && (
                <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound
                      className={cn(
                        "h-5 w-5 transition-colors duration-300",
                        isTypingOtp
                          ? "text-indigo-500 animate-pulse"
                          : "text-slate-400",
                      )}
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP code"
                    maxLength={6}
                    disabled={status === "loading" || isTypingOtp}
                    className={cn(
                      "w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-indigo-500/10 border rounded-2xl text-sm tracking-widest font-mono text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm",
                      isTypingOtp
                        ? "border-indigo-500/50 ring-2 ring-indigo-500/20"
                        : "border-indigo-500/30",
                    )}
                  />
                </div>
              )}
            </div>

            {status === "error" && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold rounded-xl text-center">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mt-4 text-emerald-600 dark:text-emerald-400 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 py-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              {loginMethod === "PASSWORD"
                ? "Enterprise Auth Enforced"
                : "Passwordless OTP Active"}
            </div>

            <button
              type="submit"
              disabled={
                status === "loading" || status === "success" || isTypingOtp
              }
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-2xl hover:scale-[1.01] active:scale-95 transition-all cursor-pointer shadow-xl shadow-indigo-600/25 group disabled:opacity-75 disabled:hover:scale-100"
            >
              {status === "loading" || isTypingOtp ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : status === "success" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Authenticated
                </>
              ) : loginMethod === "OTP" && !otpSent ? (
                <>
                  Request OTP{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  Secure Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* TOGGLE BUTTON FOR OTP VS PASSWORD */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() =>
                setLoginMethod(loginMethod === "PASSWORD" ? "OTP" : "PASSWORD")
              }
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors cursor-pointer"
            >
              {loginMethod === "PASSWORD"
                ? "Use Passwordless OTP Login instead"
                : "Switch back to Password Login"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-8">
          Secured by Placify Identity Infrastructure
        </p>
      </div>
    </main>
  );
}