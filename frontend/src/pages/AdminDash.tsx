// src/pages/AdminDash.tsx
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

export default function AdminDash() {
  const kpis = [
    {
      title: "Active Companies",
      value: "12",
      icon: Building2,
      trend: "+2 this week",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Eligible Students",
      value: "347",
      icon: Users,
      trend: "98% verified",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Shortlisted",
      value: "82",
      icon: CheckCircle2,
      trend: "Awaiting approval",
      alert: true,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Interviews Today",
      value: "51",
      icon: Calendar,
      trend: "4 rooms active",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none rounded-full hidden dark:block" />

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl relative z-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Good morning, Placement Officer 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            3 core agent operations require your executive attention today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] sm:text-xs font-bold text-indigo-400 uppercase tracking-wider self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          AI Operations Active
        </div>
      </header>

      {/* KPI Cards Grid */}
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
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Operations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Column: Pending Actions & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Actions Card */}
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Pending Executive Actions
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI-prepared work waiting for officer approval.
                </p>
              </div>
              <Bot className="w-6 h-6 text-indigo-500 shrink-0" />
            </div>

            <div className="space-y-4">
              {[
                [
                  "Approve TechNova shortlist",
                  "41 students matched above 80%",
                  "/admin/matching",
                  "Review shortlist",
                ],
                [
                  "Resolve Room A overlap",
                  "2 interviews need a new room allocation",
                  "/admin/exceptions",
                  "Open exception",
                ],
                [
                  "Publish DataSphere eligibility",
                  "Eligibility extraction vector verified",
                  "/admin/candidates",
                  "Publish results",
                ],
              ].map(([title, detail, link, action]) => (
                <div
                  key={title}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#05050A] p-4 sm:p-5 group hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex gap-3.5 items-start min-w-0">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
                    </div>
                  </div>
                  <Link
                    to={link}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1.5 whitespace-nowrap bg-white dark:bg-white/10 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm cursor-none self-end sm:self-auto"
                  >
                    {action} <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Placement Schedule Card */}
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Today&apos;s Placement Schedule
              </h2>
              <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
            </div>
            <div className="space-y-3">
              {[
                [
                  "09:00 AM",
                  "TechNova Solutions",
                  "Technical Round 1",
                  "Room 101",
                  "24 candidates",
                ],
                [
                  "11:30 AM",
                  "DataSphere AI",
                  "Aptitude Test",
                  "Lab 2",
                  "58 candidates",
                ],
                [
                  "02:00 PM",
                  "FinEdge Systems",
                  "HR Discussion",
                  "Room 204",
                  "16 candidates",
                ],
              ].map(([time, company, round, room, count]) => (
                <div
                  key={`${time}-${company}`}
                  className="flex flex-col sm:grid sm:grid-cols-[85px_1fr_auto] items-start sm:items-center gap-3 sm:gap-4 rounded-2xl bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5 p-4"
                >
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20 text-center">
                    {time}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {company}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {round} • <span className="font-semibold">{count}</span>
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 self-stretch sm:self-auto justify-center">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />{" "}
                    {room}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Agent Activity & Readiness Snapshot */}
        <div className="space-y-6">
          {/* Agent Activity Feed */}
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Agent Activity
              </h2>
              <Activity className="w-5 h-5 text-indigo-500 shrink-0" />
            </div>
            <div className="space-y-6">
              {[
                [
                  "JD Agent",
                  "Extracted 12 requirements from FinEdge JD",
                  "2 min ago",
                  "bg-cyan-500",
                ],
                [
                  "Match Agent",
                  "Ranked 82 candidates for TechNova",
                  "18 min ago",
                  "bg-indigo-500",
                ],
                [
                  "Schedule Agent",
                  "Detected Room A panel conflict",
                  "31 min ago",
                  "bg-amber-500",
                ],
                [
                  "Comms Agent",
                  "Sent 94 interview reminders",
                  "1 hr ago",
                  "bg-emerald-500",
                ],
              ].map(([agent, detail, time, color]) => (
                <div
                  key={detail}
                  className="flex gap-4 items-start relative pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0"
                >
                  <span
                    className={`mt-1.5 w-2.5 h-2.5 rounded-full ${color} shrink-0 shadow-sm`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {agent}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 leading-relaxed">
                      {detail}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      {time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Readiness Snapshot Card */}
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
                  347 / 356
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
                  81%
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5 p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Open exceptions
                </p>
                <p className="text-2xl font-black text-amber-500 font-mono mt-1">
                  3
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}