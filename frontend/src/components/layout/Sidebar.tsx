// src/components/layout/Sidebar.tsx
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
  GraduationCap,
  X,
} from "lucide-react";
import clsx from "clsx";
import { Logo } from "../ui/Logo";

const navItems = [
  { name: "Overview", path: "/admin", icon: LayoutDashboard },
  { name: "Student Portal", path: "/student", icon: GraduationCap },
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

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className="w-64 bg-white dark:bg-[#0A0A12] border-r border-slate-200 dark:border-white/10 h-screen flex flex-col flex-shrink-0 transition-colors shadow-2xl md:shadow-none"
      aria-label="Sidebar Navigation"
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/10">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-none focus:outline-none"
          aria-label="Go to Placify Home"
        >
          <Logo className="w-8 h-8 shadow-sm" iconSize="w-4 h-4" />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Placify<span className="text-indigo-500">.</span>
          </span>
        </Link>
        {/* Close button on mobile drawer */}
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden cursor-none"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

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
              onClick={onCloseMobile}
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-none focus:outline-none focus:ring-2 focus:ring-indigo-500",
                isActive
                  ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-1">
        <Link
          to="/settings"
          onClick={onCloseMobile}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-none"
        >
          <Settings className="w-4 h-4 shrink-0" aria-hidden="true" />
          Settings
        </Link>
        <a
          href="mailto:support@placify.com"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-none"
        >
          <HelpCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          Support
        </a>
      </div>
    </aside>
  );
}