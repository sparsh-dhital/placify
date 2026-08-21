// src/pages/admin/Overview.tsx
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  ShieldAlert,
  Bot,
  ArrowRight,
  CheckCircle2,
  Activity,
  FileText,
} from "lucide-react";

export default function AdminOverview() {
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
  ];

  return (
    <main
      className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12"
      aria-label="Admin Overview Dashboard"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operations Control
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            Monitor agent activity and handle operational exceptions.
          </p>
        </div>
      </header>

      {/* Primary KPI Grid */}
      <section
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        aria-label="Key Performance Indicators"
      >
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <Users className="w-5 h-5 text-indigo-500" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            642
          </h2>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Eligible Pool
          </p>
        </div>
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <Briefcase
              className="w-5 h-5 text-emerald-500"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            12
          </h2>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Active Drives
          </p>
        </div>
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <Activity className="w-5 h-5 text-amber-500" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            81%
          </h2>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Avg Readiness
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Action Required Panel */}
        <section
          aria-labelledby="actions-heading"
          className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
        >
          <h2
            id="actions-heading"
            className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6"
          >
            <ShieldAlert
              className="w-5 h-5 text-amber-500"
              aria-hidden="true"
            />{" "}
            Pending Human Actions
          </h2>
          <div className="space-y-4">
            {pendingActions.map((action, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-between group"
              >
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${action.priority === "Critical" ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}
                  >
                    {action.priority}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {action.title}
                  </h3>
                </div>
                <Link
                  to={action.link}
                  className="p-2 rounded-xl bg-white dark:bg-[#05050A] text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label={`Review ${action.title}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Launch Panel */}
        <section
          aria-labelledby="launch-heading"
          className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
        >
          <h2
            id="launch-heading"
            className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6"
          >
            <Bot className="w-5 h-5 text-indigo-500" aria-hidden="true" /> Agent
            Workflows
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/admin/jds"
              className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 transition-colors group focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <FileText
                className="w-6 h-6 text-indigo-500 mb-3"
                aria-hidden="true"
              />
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                JD Analyzer
              </h3>
            </Link>
            <Link
              to="/admin/matching"
              className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors group focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <CheckCircle2
                className="w-6 h-6 text-emerald-500 mb-3"
                aria-hidden="true"
              />
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                Matchmaker
              </h3>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}