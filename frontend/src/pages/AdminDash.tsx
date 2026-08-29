// frontend/src/pages/AdminDash.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  Bot,
  Activity,
  Briefcase,
} from "lucide-react";
import { getAdminMetrics, type AdminDashboardMetrics } from "../services/api";

export default function AdminDash() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminMetrics()
      .then((data) => {
        if (data) setMetrics(data);
      })
      .catch((err) => console.error("Failed to load admin metrics:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">
          Synchronizing live operational metrics from MongoDB...
        </p>
      </div>
    );
  }

  const kpis = [
    {
      title: "Active Companies",
      value: metrics?.active_companies_count ?? 1,
      icon: Building2,
      trend: "Live vector active",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Eligible Students",
      value: metrics?.eligible_students_count ?? 0,
      icon: Users,
      trend: "MongoDB verified",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Shortlisted",
      value: metrics?.shortlisted_count ?? 0,
      icon: CheckCircle2,
      trend: "Awaiting final schedule",
      alert: true,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Interviews Today",
      value: metrics?.interviews_today_count ?? 0,
      icon: Calendar,
      trend: "Panel roster active",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none rounded-full hidden dark:block" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl relative z-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Good morning, Placement Officer
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Live database orchestration active across student portals and
            panelist workspaces.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] sm:text-xs font-bold text-indigo-400 uppercase tracking-wider self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Real-Time Sync Active
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-xl flex flex-col justify-between group hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                  {kpi.title}
                </span>
                <div className={`p-3 rounded-2xl ${kpi.bg} shrink-0`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-500">{kpi.trend}</p>
                  {kpi.alert && (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Pending Executive Actions
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Agent workflows waiting for officer approval.
                </p>
              </div>
              <Bot className="w-6 h-6 text-indigo-500 shrink-0" />
            </div>
            <div className="space-y-4">
              {metrics?.pending_actions &&
              metrics.pending_actions.length > 0 ? (
                metrics.pending_actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#05050A] p-4 sm:p-5 group hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex gap-3.5 items-start min-w-0">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {act.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {act.detail}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={act.link}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1.5 whitespace-nowrap bg-white dark:bg-white/10 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm cursor-none self-end sm:self-auto"
                    >
                      {act.action} <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  All agent shortlists and exception queues are fully cleared.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Today&apos;s Live Interview Schedule
              </h2>
              <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
            </div>
            <div className="space-y-3">
              {metrics?.todays_schedule &&
              metrics.todays_schedule.length > 0 ? (
                metrics.todays_schedule.map((sch, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:grid sm:grid-cols-[85px_1fr_auto] items-start sm:items-center gap-3 sm:gap-4 rounded-2xl bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5 p-4"
                  >
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20 text-center">
                      {sch.time}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {sch.company}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sch.round}{" "}
                        <span className="font-semibold">{sch.count}</span>
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 self-stretch sm:self-auto justify-center">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />{" "}
                      {sch.room}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No interview slots currently committed for today.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Agent Activity
              </h2>
              <Activity className="w-5 h-5 text-indigo-500 shrink-0" />
            </div>
            <div className="space-y-6">
              {metrics?.agent_activity?.map((act, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 items-start relative pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0"
                >
                  <span
                    className={`mt-1.5 w-2.5 h-2.5 rounded-full ${act.color} shrink-0 shadow-sm`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {act.agent}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 leading-relaxed">
                      {act.detail}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-200 dark:border-white/10 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Readiness Snapshot
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span>Verified profiles</span>
                <strong className="text-slate-900 dark:text-white font-mono">
                  {metrics?.readiness_stats.verified_count ?? 0}/
                  {metrics?.readiness_stats.total_count ?? 0}
                </strong>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden p-0.5 border border-slate-200 dark:border-white/5">
                <div className="h-full w-[98%] bg-emerald-500 rounded-full shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5 p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Avg. readiness
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                  {metrics?.readiness_stats.avg_readiness ?? 84}%
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5 p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Open exceptions
                </p>
                <p className="text-2xl font-black text-amber-500 font-mono mt-1">
                  {metrics?.readiness_stats.open_exceptions ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}