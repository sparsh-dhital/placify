// src/components/layout/Topbar.tsx
import { Search, Bell, LogOut, Menu, CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../services/api";
// @ts-expect-error -- ThemeToggle is a JS component without TS declarations
import ThemeToggle from "../ui/ThemeToggle";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

const quickLinks = [
  { label: "Overview", path: "/admin" },
  { label: "JD Analyzer", path: "/admin/jds" },
  { label: "Eligibility Agent", path: "/admin/candidates" },
  { label: "Matchmaker Agent", path: "/admin/matching" },
  { label: "Placements", path: "/admin/placements" },
  { label: "Scheduler", path: "/admin/interviews" },
  { label: "Interview Panels", path: "/admin/panelists" },
  { label: "Communications", path: "/admin/communications" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Exceptions", path: "/admin/exceptions" },
];

const initialNotifications = [
  {
    id: 1,
    title: "Offer review ready",
    detail: "TechNova shortlist needs board approval before tomorrow’s review.",
    read: false,
    time: "2 min ago",
  },
  {
    id: 2,
    title: "Interview room updated",
    detail: "Room 204 has been reassigned for the Systems panel.",
    read: true,
    time: "18 min ago",
  },
  {
    id: 3,
    title: "Resume sync complete",
    detail: "Student readiness updates are now visible in the candidate stack.",
    read: false,
    time: "1 hr ago",
  },
];

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const matchingLinks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return quickLinks.filter(({ label, path }) => {
      const haystack = `${label} ${path}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const handleSelectLink = (path: string) => {
    setQuery("");
    navigate(path);
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAllAsRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" && matchingLinks[0]) {
      event.preventDefault();
      handleSelectLink(matchingLinks[0].path);
    }
  };

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
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search dashboard pages..."
            aria-label="Search dashboard pages"
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
          />

          {query.trim() && matchingLinks.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0A0A12]/95 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
              {matchingLinks.slice(0, 5).map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleSelectLink(item.path)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">
                    Go
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((value) => !value)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[22rem] rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0A0A12]/95 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur-xl z-50">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Notifications
                </h3>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              </div>

              <div className="space-y-2">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setNotifications((current) =>
                        current.map((notification) =>
                          notification.id === item.id
                            ? { ...notification, read: true }
                            : notification,
                        ),
                      )
                    }
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      item.read
                        ? "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
                        : "border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                          {item.detail}
                        </p>
                      </div>
                      {!item.read && (
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
                      )}
                    </div>
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {item.time}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <ThemeToggle />
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
          aria-label="Sign out of admin account"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden xs:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
