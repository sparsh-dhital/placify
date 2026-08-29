// frontend/src/pages/admin/Analytics.tsx
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Briefcase, Award } from "lucide-react";
import { apiGet } from "../../services/api";

interface Metrics {
  total_students: number;
  eligible_students: number;
  placed_students: number;
  placement_rate: number;
  total_drives: number;
  total_interviews: number;
}

interface DeptStat {
  department: string;
  placed: number;
  total: number;
}

export default function Analytics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [departments, setDepartments] = useState<DeptStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/admin/analytics")
      .then(
        (res: {
          success: boolean;
          metrics: Metrics;
          department_stats: DeptStat[];
        }) => {
          if (res.success) {
            setMetrics(res.metrics);
            setDepartments(res.department_stats || []);
          }
        },
      )
      .catch((err: unknown) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-500 font-medium">
        Loading live analytics from MongoDB...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-indigo-500" />
          Placement Analytics & Insights
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
          Real-time metrics aggregated from active database registers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Students
            </span>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
            {metrics?.total_students || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Placement Rate
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
            {metrics?.placement_rate || 0}%
          </p>
        </div>
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Active Drives
            </span>
            <Briefcase className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
            {metrics?.total_drives || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Interviews Scheduled
            </span>
            <Award className="w-5 h-5 text-cyan-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
            {metrics?.total_interviews || 0}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Department Placement Breakdown
        </h2>
        <div className="space-y-4">
          {departments.map((d) => (
            <div key={d.department} className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                <span>{d.department}</span>
                <span>
                  {d.placed} / {d.total} Placed
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${Math.min(100, (d.placed / Math.max(d.total, 1)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}