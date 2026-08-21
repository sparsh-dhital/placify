// src/pages/admin/Overview.tsx
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  ShieldAlert,
  Bot,
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock,
  Calendar,
} from "lucide-react";

export default function AdminOverview() {
  // Mock data for the dashboard overview
  const stats = [
    {
      label: "Total Students",
      value: "850",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-500/20",
    },
    {
      label: "Active Drives",
      value: "12",
      icon: Briefcase,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
      border: "border-indigo-200 dark:border-indigo-500/20",
    },
    {
      label: "Eligible Pool",
      value: "642",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/20",
    },
    {
      label: "Pending Actions",
      value: "5",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/20",
    },
  ];

  const aiOperations = [
    { task: "JD Analysis: TechNova", status: "completed", time: "10 mins ago" },
    {
      task: "Eligibility Check: DataSphere",
      status: "completed",
      time: "1 hour ago",
    },
    {
      task: "Matchmaker: TechNova",
      status: "in-progress",
      time: "Processing...",
    },
    { task: "Schedule Recovery", status: "pending", time: "Awaiting Input" },
  ];

  const pendingActions = [
    {
      title: "Approve TechNova Shortlist",
      type: "Approval",
      priority: "High",
      link: "/admin/matching",
    },
    {
      title: "Resolve Room 101 Conflict",
      type: "Exception",
      priority: "Critical",
      link: "/admin/exceptions",
    },
    {
      title: "Verify New Job Description",
      type: "Review",
      priority: "Medium",
      link: "/admin/jds",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Good Morning, Admin 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm font-medium">
            Here is your placement operations summary for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            System Online
          </span>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-xl shadow-slate-900/5 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl border ${stat.bg} ${stat.border}`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Operations Feed */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-500" /> AI Operations
            </h2>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {aiOperations.map((op, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      op.status === "completed"
                        ? "bg-emerald-500"
                        : op.status === "in-progress"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {op.task}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{op.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/10">
            <Link
              to="/admin/activity"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center justify-center gap-1 cursor-none"
            >
              View Full Audit Log <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Right Column: Pending Human Actions */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" /> Pending Actions
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {pendingActions.map((action, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-indigo-500/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        action.priority === "Critical"
                          ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                          : action.priority === "High"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                            : "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300 border border-slate-300 dark:border-white/10"
                      }`}
                    >
                      {action.priority}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {action.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {action.title}
                  </h3>
                </div>

                <Link
                  to={action.link}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-[#05050A] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-semibold rounded-xl border border-slate-200 dark:border-white/10 transition-colors cursor-none shrink-0"
                >
                  Review <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}