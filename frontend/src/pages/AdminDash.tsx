// frontend/src/pages/AdminDash.tsx
import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  UserCheck,
  Calendar,
  ShieldAlert,
  Activity,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminMetrics } from "../services/api";
import type { AdminDashboardMetrics } from "../services/api";

export default function AdminDash() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminMetrics()
      .then((data: AdminDashboardMetrics) => {
        setMetrics(data);
      })
      .catch((err: any) => {
        console.error("Admin dashboard fetch error:", err);
        setError(err.message || "Failed to load admin metrics.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[#05050A]">
        <div className="w-16 h-16 rounded-full border-t-[3px] border-indigo-600 animate-spin mb-4 shadow-xl shadow-indigo-500/10"></div>
        <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm tracking-wider uppercase">
          Initializing Multi-Agent Command Center...
        </p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200 dark:border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
          Dashboard Synchronization Error
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
          {error ||
            "Unable to fetch administrative metrics from MongoDB backend."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const stats = [
    {
      title: "Active Companies",
      value: metrics.active_companies_count ?? 0,
      icon: Building2,
      color:
        "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20",
    },
    {
      title: "Eligible Registers",
      value: metrics.eligible_students_count ?? 0,
      icon: Users,
      color:
        "text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/20",
    },
    {
      title: "Shortlisted Roster",
      value: metrics.shortlisted_count ?? 0,
      icon: UserCheck,
      color:
        "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
    },
    {
      title: "Interviews Today",
      value: metrics.interviews_today_count ?? 0,
      icon: Calendar,
      color:
        "text-purple-500 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4 sm:px-6 lg:px-8 mt-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous Orchestrator Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Placement Command Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Real-time multi-agent oversight for recruitment drives, eligibility
            rules, and schedules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/jd-analyzer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Run JD Analyzer
          </Link>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx: number) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#0A0A12] border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-6 shadow-xl shadow-slate-900/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {stat.title}
                </span>
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-inner ${stat.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Actions & Exception Center */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-[#0A0A12] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-500" /> Pending Action
              Queue
            </h2>
            <div className="space-y-4">
              {metrics.pending_actions && metrics.pending_actions.length > 0 ? (
                metrics.pending_actions.map((action: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 gap-4 hover:border-indigo-500/40 transition-all"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        {action.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {action.detail}
                      </p>
                    </div>
                    <Link
                      to={action.link || "/admin/shortlist"}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
                    >
                      {action.action || "Resolve"}{" "}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm font-medium">
                  No critical actions pending in the queue. All agent workflows
                  are running smoothly.
                </div>
              )}
            </div>
          </section>

          {/* Today's Schedule */}
          <section className="bg-white dark:bg-[#0A0A12] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-indigo-500" /> Today's
              Recruitment Roster
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <th className="pb-4 font-black">Time Slot</th>
                    <th className="pb-4 font-black">Company</th>
                    <th className="pb-4 font-black">Round</th>
                    <th className="pb-4 font-black">Room / Panel</th>
                    <th className="pb-4 font-black text-right">Candidates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                  {metrics.todays_schedule &&
                  metrics.todays_schedule.length > 0 ? (
                    metrics.todays_schedule.map((item: any, idx: number) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 font-mono font-bold text-slate-900 dark:text-white">
                          {item.time}
                        </td>
                        <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">
                          {item.company}
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-400">
                          {item.round}
                        </td>
                        <td className="py-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                          {item.room}
                        </td>
                        <td className="py-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {item.count}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-400 text-sm font-medium"
                      >
                        No active interviews scheduled for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Agent Activity Feed & Readiness Stats */}
        <div className="space-y-8">
          <section className="bg-white dark:bg-[#0A0A12] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Activity className="w-6 h-6 text-indigo-500" /> Multi-Agent
              Activity
            </h2>
            <div className="space-y-5">
              {metrics.agent_activity && metrics.agent_activity.length > 0 ? (
                metrics.agent_activity.map((act: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-4 items-start pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 font-bold shadow-sm text-xs">
                      AI
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {act.agent}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {act.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {act.detail}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  No recent agent activity recorded.
                </p>
              )}
            </div>
          </section>

          {/* Readiness Summary */}
          <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden border border-indigo-500/30">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-lg font-black uppercase tracking-widest text-indigo-200 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Readiness Overview
            </h2>
            <div className="space-y-4 relative z-10 text-sm">
              <div className="flex justify-between items-center bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                <span className="text-indigo-100 font-medium">
                  Verified Profiles
                </span>
                <strong className="font-mono text-lg">
                  {metrics.readiness_stats?.verified_count ?? 0} /{" "}
                  {metrics.readiness_stats?.total_count ?? 0}
                </strong>
              </div>
              <div className="flex justify-between items-center bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                <span className="text-indigo-100 font-medium">
                  Average Readiness
                </span>
                <strong className="font-mono text-lg text-cyan-300">
                  {metrics.readiness_stats?.avg_readiness ?? 88}%
                </strong>
              </div>
              <div className="flex justify-between items-center bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                <span className="text-indigo-100 font-medium">
                  Open Exceptions
                </span>
                <strong className="font-mono text-lg text-amber-300">
                  {metrics.readiness_stats?.open_exceptions ?? 0}
                </strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}