// src/components/layout/Sidebar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Calendar,
  UsersRound,
  MessageSquare,
  BarChart3,
  LogOut,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { Logo } from "../ui/Logo";
import { clearAuthSession } from "../../services/api";

const navItems = [
  { name: "Overview", path: "/admin", icon: LayoutDashboard },
  { name: "JD Analyzer", path: "/admin/jds", icon: FileText },
  { name: "Eligibility Agent", path: "/admin/candidates", icon: Users },
  { name: "Matchmaker Agent", path: "/admin/matching", icon: ShieldCheck },
  { name: "Placements", path: "/admin/placements", icon: Briefcase },
  { name: "Scheduler Agent", path: "/admin/interviews", icon: Calendar },
  { name: "Interview Panels", path: "/admin/panelists", icon: UsersRound },
  {
    name: "Communications",
    path: "/admin/communications",
    icon: MessageSquare,
  },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
];

const studentNavItems = [
  { name: "My Dashboard", path: "/student", icon: LayoutDashboard },
  { name: "Resume & Eligibility", path: "/student/resume", icon: FileText },
  {
    name: "Job Opportunities",
    path: "/student/opportunities",
    icon: Briefcase,
  },
  { name: "My Interviews", path: "/student/interviews", icon: Calendar },
  { name: "Skill Readiness", path: "/student/readiness", icon: BarChart3 },
];

export default function Sidebar({
  onCloseMobile,
}: {
  onCloseMobile?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isStudent = location.pathname.startsWith("/student");
  const visibleNavItems = isStudent ? studentNavItems : navItems;

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className="w-64 bg-white dark:bg-[#0A0A12] border-r border-slate-200 dark:border-white/10 h-screen sticky top-0 flex flex-col flex-shrink-0 transition-colors relative z-50"
      aria-label="Sidebar Navigation"
    >
      <div className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center px-6 relative z-50">
        <Link
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 w-full text-left no-underline hover:no-underline hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 bg-transparent border-none cursor-pointer"
          aria-label="Go to Placify Home"
        >
          <Logo className="w-8 h-8 shadow-sm" iconSize="w-4 h-4" />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white select-none">
            Placify<span className="text-indigo-500">.</span>
          </span>
        </Link>
      </div>

      <nav
        className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5"
        aria-label="Main Navigation"
      >
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onCloseMobile}
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                isActive
                  ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5",
              )}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-1">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sign Out
        </button>
        <a
          href="mailto:support@placify.com"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          Support
        </a>
      </div>
    </aside>
  );
}
