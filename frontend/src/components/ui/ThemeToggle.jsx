import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      // Updated the track to use our new glassmorphic dark mode tokens
      className="relative inline-flex h-9 w-16 items-center rounded-full bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/5 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050A] cursor-none shadow-inner"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      role="switch"
      aria-checked={isDark}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        // Updated the circle to dark:bg-slate-800 with a subtle border so it pops against the track
        className={`inline-block h-7 w-7 transform rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 transition-transform duration-300 ease-in-out flex items-center justify-center ${
          isDark ? "translate-x-8" : "translate-x-1"
        }`}
      >
        {isDark ? (
          // Replaced the old custom accent class with text-indigo-400
          <Moon className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-orange-500" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}