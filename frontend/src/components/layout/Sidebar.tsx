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

const navItems = [
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

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className="w-64 bg-[#0D111A] border-r border-[#253047] h-screen flex flex-col flex-shrink-0"
      aria-label="Sidebar Navigation"
    >
      <div className="h-16 flex items-center px-6 border-b border-[#253047]">
        <span className="text-lg font-semibold text-text-primary tracking-tight">
          Placify
        </span>
      </div>

      <nav
        className="flex-1 overflow-y-auto py-6 px-3 space-y-1"
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
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary",
                isActive
                  ? "bg-accent-primary/10 text-accent-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-[#111827]",
              )}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#253047] space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-[#111827] transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          Settings
        </Link>
        <a
          href="mailto:sparshdhital.official@gmail.com"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-[#111827] transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
        >
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          Support
        </a>
      </div>
    </aside>
  );
}
