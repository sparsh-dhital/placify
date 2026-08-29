// frontend/src/pages/admin/Scheduler.tsx
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { generateSchedule, getActiveJobs } from "../../services/api";
import type { ScheduleResponse, JobRecord } from "../../services/api";

export default function Scheduler() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeJobs, setActiveJobs] = useState<JobRecord[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveJobs()
      .then((res) => {
        if (res.success && res.jobs.length > 0) {
          setActiveJobs(res.jobs);
          const active =
            res.jobs.find((j) => j.status === "active") || res.jobs[0];
          setSelectedJobId(active.job_id);
        } else {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch jobs:", err);
        setError(err.message || "Failed to load active jobs.");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    handleRunScheduler(selectedJobId);
  }, [selectedJobId]);

  const handleRunScheduler = async (jobId: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateSchedule(jobId);
      setData(result);
    } catch (err: any) {
      console.error("Scheduler execution error:", err);
      setError(err.message || "Failed to generate interview schedule.");
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Initializing Scheduler Agent & Conflict Resolver...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous Scheduling Agent
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-indigo-500" />
            Interview Roster & Conflict Resolver
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-xl">
            Automatically slot shortlisted candidates into available rooms and
            panel panels while eliminating timing overlaps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeJobs.length > 0 && (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              {activeJobs.map((j) => (
                <option key={j.job_id} value={j.job_id}>
                  {j.company} - {j.role}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => selectedJobId && handleRunScheduler(selectedJobId)}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-75"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
            />
            {isGenerating ? "Optimizing..." : "Re-Run Scheduler"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}

      {data?.conflict_detected && data.conflict_details && (
        <div className="p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-200 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Conflict Detected: {data.conflict_details.type}
              </span>
              <h2 className="text-base font-bold text-amber-950 dark:text-amber-200">
                {data.conflict_details.description}
              </h2>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                <strong className="font-bold">Impact:</strong>{" "}
                {data.conflict_details.impact} |{" "}
                <strong className="font-bold">Recommendation:</strong>{" "}
                {data.conflict_details.recommendation}
              </p>
            </div>
          </div>
          <span className="px-4 py-2 bg-amber-200/60 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-500/30 shrink-0">
            Auto-Resolving...
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" /> Optimized
              Interview Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Generated by Placify Schedule Agent with zero scheduling overlaps.
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> {data?.schedule?.length || 0}{" "}
            Slots Booked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/30 dark:bg-white/5">
                <th className="p-5 font-black">Candidate</th>
                <th className="p-5 font-black">Panelist / Board</th>
                <th className="p-5 font-black">Location / Room</th>
                <th className="p-5 font-black">Time Slot</th>
                <th className="p-5 font-black text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
              {data?.schedule && data.schedule.length > 0 ? (
                data.schedule.map((item) => {
                  const isConfirmed = item.status === "confirmed";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="p-5 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 text-xs">
                          <Users className="w-4 h-4" />
                        </div>
                        {item.student}
                      </td>
                      <td className="p-5 font-medium text-slate-800 dark:text-slate-200">
                        {item.panel}
                      </td>
                      <td className="p-5 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5 pt-6">
                        <MapPin className="w-3.5 h-3.5" /> {item.room}
                      </td>
                      <td className="p-5 font-mono text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />{" "}
                          {item.start_time} - {item.end_time}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <span
                          className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                            isConfirmed
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-slate-400 text-sm font-medium"
                  >
                    No schedule slots generated. Please ensure candidate
                    shortlists are confirmed first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}