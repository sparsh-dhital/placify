import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Calendar,
  UsersRound,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { Logo } from "../ui/Logo";
import { getSession } from "../../utils/session";

const adminNavItems = [
  { name: "Overview", path: "/admin", icon: LayoutDashboard },
  { name: "Placements", path: "/admin/placements", icon: Briefcase },
  { name: "Candidates", path: "/admin/candidates", icon: Users },
  { name: "Job Descriptions", path: "/admin/jds", icon: FileText },
  { name: "Matching", path: "/admin/matching", icon: ShieldCheck },
  { name: "Interviews", path: "/admin/interviews", icon: Calendar },
  { name: "Panelists", path: "/admin/panelists", icon: UsersRound },
  {
    name: "Communications",
    path: "/admin/communications",
    icon: MessageSquare,
  },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
];

const studentNavItems = [
  { name: "My Dashboard", path: "/student", icon: LayoutDashboard },
  { name: "Resume Analyzer", path: "/student/resume", icon: FileText },
  { name: "Opportunities", path: "/student/opportunities", icon: Briefcase },
];

const panelistNavItems = [
  { name: "Today's Interviews", path: "/panelist", icon: Calendar },
  { name: "Candidates", path: "/panelist/candidates", icon: Users },
];

export default function Sidebar() {
  const location = useLocation();
  const role = getSession()?.role;
  const navItems =
    role === "STUDENT"
      ? studentNavItems
      : role === "PANELIST"
        ? panelistNavItems
        : adminNavItems;

  return (
    <aside
      className="w-64 bg-white dark:bg-[#0A0A12] border-r border-slate-200 dark:border-white/10 h-screen flex flex-col flex-shrink-0 transition-colors"
      aria-label="Sidebar Navigation"
    >
      {/* Wrapped Logo in a Link to redirect to Landing Page */}
      <Link
        to="/"
        className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-none focus:outline-none focus:ring-2 focus:ring-indigo-500 inset-0"
        aria-label="Go to Placify Home"
      >
        <Logo className="w-8 h-8 shadow-sm" iconSize="w-4 h-4" />
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Placify<span className="text-indigo-500">.</span>
        </span>
      </Link>

      <nav
        className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5"
        aria-label="Main Navigation"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-none focus:outline-none focus:ring-2 focus:ring-indigo-500",
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
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          Settings
        </Link>
        <a
          href="mailto:support@placify.com"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          Support
        </a>
      </div>
    </aside>
  );
}
