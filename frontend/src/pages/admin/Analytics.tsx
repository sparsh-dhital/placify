// src/pages/admin/Analytics.tsx
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Users,
  Briefcase,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";

export default function Analytics() {
  // Mock data for analytics visualization
  const kpis = [
    {
      label: "Overall Placement Rate",
      value: "78%",
      target: "Goal: 90%",
      trend: "+12% this month",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/20",
    },
    {
      label: "Total Offers Extended",
      value: "342",
      target: "From 45 companies",
      trend: "+45 this week",
      icon: Briefcase,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
      border: "border-indigo-200 dark:border-indigo-500/20",
    },
    {
      label: "Avg. Match Score",
      value: "84%",
      target: "Platform-wide",
      trend: "+5% vs last year",
      icon: Target,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/20",
    },
    {
      label: "Highest Package",
      value: "24 LPA",
      target: "TechNova Solutions",
      trend: "Top 1% of pool",
      icon: Award,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-500/20",
    },
  ];

  const skillGaps = [
    { skill: "Docker & Containerization", percentage: 65, missingCount: 142 },
    { skill: "System Design", percentage: 48, missingCount: 98 },
    { skill: "Cloud Architecture (AWS)", percentage: 42, missingCount: 85 },
    { skill: "Advanced Data Structures", percentage: 25, missingCount: 54 },
    { skill: "Agile Methodologies", percentage: 15, missingCount: 32 },
  ];

  const readinessDistribution = [
    {
      tier: "Ready for Interviews (Score 80-100)",
      count: 420,
      color: "bg-emerald-500",
    },
    { tier: "Needs Polish (Score 60-79)", count: 280, color: "bg-amber-500" },
    { tier: "Significant Gaps (Score < 60)", count: 150, color: "bg-red-500" },
  ];
  const totalStudents = 850;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-500" aria-hidden="true" />
            Platform Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-xl">
            Macro-level insights into placement readiness, active skill gaps,
            and hiring trends across the university.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#05050A] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white text-sm font-semibold rounded-xl border border-slate-200 dark:border-white/10 transition-colors cursor-none shadow-sm">
          Export Report <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-xl shadow-slate-900/5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl border ${kpi.bg} ${kpi.border}`}
                >
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                  {kpi.trend}
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {kpi.value}
                </h3>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  {kpi.label}
                </p>
                <p className="text-xs text-slate-400 mt-1">{kpi.target}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Top Skill Gaps (Native Tailwind Bar Chart) */}
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 p-6 sm:p-8 flex flex-col">
          <div className="mb-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Macro Skill Gaps
              </h2>
              <p className="text-sm text-slate-500">
                Most frequently missing requirements
              </p>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
              <Target className="w-5 h-5 text-indigo-500" />
            </div>
          </div>

          <div className="flex-1 space-y-5">
            {skillGaps.map((gap, idx) => (
              <div key={idx} className="space-y-2 group cursor-none">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {gap.skill}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">
                    {gap.missingCount} students missing
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-white/5">
                  <div
                    className="bg-indigo-500 h-2.5 rounded-full relative overflow-hidden group-hover:bg-indigo-400 transition-colors"
                    style={{ width: `${gap.percentage}%` }}
                  >
                    <div className="absolute top-0 left-0 bottom-0 right-0 w-full h-full bg-white/20 animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Readiness Distribution */}
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 p-6 sm:p-8 flex flex-col">
          <div className="mb-6 flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Readiness Distribution
              </h2>
              <p className="text-sm text-slate-500">
                AI computed cohort preparedness
              </p>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <GraduationCap className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-8">
            {/* Custom Multi-Segment Progress Bar */}
            <div className="h-6 w-full rounded-full overflow-hidden flex border border-slate-200 dark:border-white/10 shadow-inner">
              {readinessDistribution.map((tier, idx) => (
                <div
                  key={idx}
                  className={`h-full ${tier.color} transition-all duration-1000 ease-in-out`}
                  style={{ width: `${(tier.count / totalStudents) * 100}%` }}
                  title={`${tier.tier}: ${tier.count} students`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-4">
              {readinessDistribution.map((tier, idx) => {
                const percentage = Math.round(
                  (tier.count / totalStudents) * 100,
                );
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-colors cursor-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${tier.color} shadow-sm`}
                      />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {tier.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500">
                        <Users className="w-3 h-3 inline mr-1 opacity-50" />
                        {tier.count}
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white w-10 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}