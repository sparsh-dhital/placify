// src/pages/Login.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";
import { Logo } from "../components/ui/Logo";
// @ts-expect-error
import ThemeToggle from "../components/ui/ThemeToggle";
import { cn } from "../utils/cn";
import {
  loginUser,
  requestSignupOtp,
  verifySignupOtp,
  requestPasswordResetOtp,
  resetPassword,
  verifyOAuthCode,
} from "../services/api";

type ViewState = "login" | "signup" | "forgot" | "otp";
type Role = "ADMIN" | "STUDENT" | "PANELIST";

export default function Login() {
  const [view, setView] = useState<ViewState>("login");
  const [otpContext, setOtpContext] = useState<"login" | "signup" | "forgot">(
    "login",
  );

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [otpCode, setOtpCode] = useState("");

  // UX States
  const [isTypingOtp, setIsTypingOtp] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const [pendingLoginData, setPendingLoginData] = useState<any>(null);

  // --- OAUTH CALLBACK INTERCEPTOR (With Ref Guard to Prevent StrictMode Double-Firing) ---
  const oauthProcessedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code && state && !oauthProcessedRef.current) {
      oauthProcessedRef.current = true;
      const [oauthRole, provider] = state.split("_");
      setStatus("loading");

      verifyOAuthCode(code, provider, oauthRole)
        .then(handleRouteSuccess)
        .catch((err: any) => {
          setStatus("error");
          setErrorMessage(err.message || "Authentication cancelled or failed.");
          window.history.replaceState({}, document.title, "/login");
        });
    }
  }, []);

  useEffect(() => {
    if (!window.location.search.includes("code=")) {
      setStatus("idle");
      setErrorMessage("");
      setOtpCode("");
    }
  }, [view]);

  useEffect(() => {
    if (view === "login") {
      if (role === "ADMIN") setEmail("admin@placify.com");
      if (role === "STUDENT") setEmail("student@placify.com");
      if (role === "PANELIST") setEmail("panelist@placify.com");
    } else {
      setEmail("");
    }
  }, [role, view]);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address.");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    if (view === "signup" && name.trim().length < 2) {
      throw new Error("Please enter your full name.");
    }
  };

  const handleRouteSuccess = (data: any) => {
    localStorage.setItem("placify_token", data.access_token);
    localStorage.setItem("placify_user", JSON.stringify(data.user));
    setStatus("success");

    window.history.replaceState({}, document.title, "/login");

    setTimeout(() => {
      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "panelist") navigate("/panelist");
      else navigate("/student");
    }, 800);
  };

  const simulateOtpTyping = (mockOtp: string) => {
    setIsTypingOtp(true);
    setOtpCode("");
    setTimeout(() => {
      let currentIndex = 0;
      const otpString = String(mockOtp);
      const typingInterval = setInterval(() => {
        if (currentIndex <= otpString.length) {
          setOtpCode(otpString.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTypingOtp(false);
        }
      }, 150);
    }, 600);
  };

  const handleSocialLogin = (provider: "Google" | "GitHub") => {
    setStatus("loading");

    const redirectUri = encodeURIComponent("http://localhost:5173/login");
    const state = `${role.toLowerCase()}_${provider.toLowerCase()}`;

    if (provider === "Google") {
      const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile&state=${state}`;
    } else {
      const clientId =
        import.meta.env.VITE_GITHUB_CLIENT_ID || "YOUR_GITHUB_CLIENT_ID";
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email&state=${state}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      if (view === "login") {
        const data = await loginUser({ email, password });
        setPendingLoginData(data);
        setOtpContext("login");
        setView("otp");
        simulateOtpTyping("123456");
      } else if (view === "signup") {
        validateForm();
        const res = await requestSignupOtp(email);
        setOtpContext("signup");
        setView("otp");
        if (res.mock_otp) simulateOtpTyping(res.mock_otp);
        else setStatus("idle");
      } else if (view === "forgot") {
        validateForm();
        const res = await requestPasswordResetOtp(email);
        setOtpContext("forgot");
        setView("otp");
        if (res.mock_otp) simulateOtpTyping(res.mock_otp);
        else setStatus("idle");
      } else if (view === "otp") {
        if (otpContext === "login") {
          if (otpCode !== "123456")
            throw new Error("Invalid Verification Code.");
          handleRouteSuccess(pendingLoginData);
        } else if (otpContext === "signup") {
          const data = await verifySignupOtp({
            name,
            email,
            password,
            role: role.toLowerCase(),
            otp: otpCode,
          });
          handleRouteSuccess(data);
        } else if (otpContext === "forgot") {
          await resetPassword({ email, otp: otpCode, new_password: password });
          setStatus("success");
          setErrorMessage("Password reset successful! Please log in.");
          setTimeout(() => {
            setView("login");
            setPassword("");
            setStatus("idle");
          }, 2000);
        }
      }
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white relative bg-[#FAFAFA] dark:bg-[#05050A] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans overflow-x-hidden"
      role="main"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none rounded-full hidden dark:block" />

      <nav className="w-full flex items-center justify-between px-6 sm:px-10 py-4 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#05050A]/80 backdrop-blur-2xl sticky top-0 z-50 transition-colors shadow-sm">
        <Link
          to="/"
          aria-label="Return to homepage"
          className="group relative inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg shadow-indigo-600/25 shrink-0"
        >
          <span className="relative flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
            Home
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-[420px]">
          <header className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Logo
              className="w-12 h-12 mb-4 shadow-md border border-slate-200/50 dark:border-white/5"
              iconSize="w-6 h-6"
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {view === "login" && "Sign In"}
              {view === "signup" && "Create Account"}
              {view === "forgot" && "Reset Password"}
              {view === "otp" && "Security Verification"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
              {view === "login" &&
                "Enter your credentials to access your workspace."}
              {view === "signup" && "Join the Placify placement ecosystem."}
              {view === "forgot" && "We'll help you recover your access."}
              {view === "otp" && "Enter the 6-digit code sent to your inbox."}
            </p>
          </header>

          <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <form
              onSubmit={handleSubmit}
              className="space-y-5 relative z-10"
              aria-labelledby="form-heading"
            >
              <h2 id="form-heading" className="sr-only">
                Authentication Form
              </h2>

              {view !== "otp" && view !== "forgot" && (
                <fieldset className="space-y-2 animate-in fade-in">
                  <legend className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Select Workspace
                  </legend>
                  <div
                    role="tablist"
                    aria-label="Workspace Role"
                    className="flex p-1 bg-slate-100 dark:bg-[#05050A] rounded-xl border border-slate-200 dark:border-white/5"
                  >
                    {(["STUDENT", "PANELIST", "ADMIN"] as Role[]).map((r) => {
                      const isSelected = role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => setRole(r)}
                          className={cn(
                            "flex-1 py-2 px-1 text-[11px] font-bold rounded-lg transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                            isSelected
                              ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                          )}
                        >
                          {r === "ADMIN"
                            ? "Officer"
                            : r.charAt(0) + r.slice(1).toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {view === "otp" ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label
                    htmlFor="otpCode"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Verification Code
                  </label>
                  <input
                    id="otpCode"
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="1 2 3 4 5 6"
                    maxLength={6}
                    disabled={status === "loading" || isTypingOtp}
                    className={cn(
                      "w-full px-4 py-3.5 bg-slate-50 dark:bg-[#05050A] border rounded-xl text-base tracking-[0.3em] font-mono text-center text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner",
                      isTypingOtp
                        ? "border-indigo-500/50"
                        : "border-slate-200 dark:border-white/10",
                    )}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {view === "signup" && (
                    <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-300">
                      <label
                        htmlFor="fullName"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                      >
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aarav Mehta"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner disabled:opacity-60"
                        disabled={status === "loading" || status === "success"}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-300">
                    <label
                      htmlFor="emailAddress"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                    >
                      University Email
                    </label>
                    <input
                      id="emailAddress"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@university.edu"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner disabled:opacity-60"
                      disabled={status === "loading" || status === "success"}
                    />
                  </div>

                  <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-300">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        view === "forgot" ? "Enter new password" : "••••••••"
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner disabled:opacity-60"
                      disabled={status === "loading" || status === "success"}
                    />
                  </div>
                </div>
              )}

              <div aria-live="polite" className="empty:hidden">
                {status === "error" && (
                  <div className="p-3 mt-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl text-center animate-in fade-in">
                    {errorMessage}
                  </div>
                )}
                {status === "success" &&
                  view === "otp" &&
                  otpContext === "forgot" && (
                    <div className="p-3 mt-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl text-center animate-in fade-in">
                      {errorMessage}
                    </div>
                  )}
              </div>

              <button
                type="submit"
                disabled={
                  status === "loading" || status === "success" || isTypingOtp
                }
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/25 disabled:opacity-75 disabled:hover:scale-100 active:scale-[0.98] group"
              >
                {status === "loading" || isTypingOtp ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : status === "success" &&
                  view === "otp" &&
                  otpContext === "signup" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Account Created
                  </>
                ) : status === "success" &&
                  view === "otp" &&
                  otpContext === "login" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Authenticated
                  </>
                ) : view === "login" ? (
                  <>
                    Continue{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : view === "otp" ? (
                  <>
                    Verify Secure Code{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    Continue{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {(view === "login" || view === "signup") && (
                <div className="pt-2 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      or continue with
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin("Google")}
                      disabled={status === "loading" || status === "success"}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialLogin("GitHub")}
                      disabled={status === "loading" || status === "success"}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      GitHub
                    </button>
                  </div>
                </div>
              )}
            </form>

            <footer className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col items-center gap-2">
              {view === "login" && (
                <>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    Forgot your password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("signup")}
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    Don't have an account?{" "}
                    <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2">
                      Sign up
                    </span>
                  </button>
                </>
              )}

              {(view === "signup" || view === "forgot") && (
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Already have an account?{" "}
                  <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2">
                    Sign In
                  </span>
                </button>
              )}

              {view === "otp" && (
                <button
                  type="button"
                  onClick={() => setView(otpContext)}
                  className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Didn't receive a code? Go back
                </button>
              )}
            </footer>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <a
              href="mailto:support@placify.com"
              className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Need help? Contact Placify Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}