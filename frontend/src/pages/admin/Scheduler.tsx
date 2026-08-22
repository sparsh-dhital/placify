// src/pages/admin/Scheduler.tsx
import { useState } from "react";
import {
  Calendar,
  Play,
  AlertTriangle,
  Check,
  ShieldCheck,
  Clock,
  MapPin,
  UsersRound,
} from "lucide-react";
import { generateSchedule } from "../../services/api";
import type { ScheduleResponse } from "../../services/api";

export default function Scheduler() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [conflictResolved, setConflictResolved] = useState(false);

  const activeJobId = "20000000-0000-0000-0000-000000000001";

  const handleGenerate = async () => {
    setIsProcessing(true);
    setData(null);
    setConflictResolved(false);
    try {
      // Toggle 'true' to 'false' when backend API is live
      const result = await generateSchedule(activeJobId, true);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptAISolution = () => {
    setConflictResolved(true);
    // In production, this would trigger an API call to recalculate or apply the fix
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Agent Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-500" aria-hidden="true" />
            Interview Scheduler
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-xl">
            Map approved shortlists to available rooms and panels. The agent
            automatically detects bottlenecks and double-bookings.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all cursor-none shadow-lg shadow-indigo-600/25 shrink-0"
        >
          {isProcessing ? (
            <Calendar className="w-4 h-4 animate-bounce" aria-hidden="true" />
          ) : (
            <Play className="w-4 h-4" aria-hidden="true" />
          )}
          {isProcessing ? "Allocating Resources..." : "Generate AI Schedule"}
        </button>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-12 shadow-xl shadow-slate-900/5 flex flex-col items-center justify-center text-center">
          <div className="relative w-20 h-20 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
            <Clock
              className="w-8 h-8 text-indigo-400 animate-pulse"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Resolving Hard Constraints
          </h3>
          <p className="text-sm text-slate-500 font-mono">
            Checking room capacities, panel availability, and student
            overlaps...
          </p>
        </div>
      )}

      {/* Results View */}
      {data && !isProcessing && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Conflict Detection Panel */}
          {data.conflict_detected && !conflictResolved && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-400 dark:border-amber-500/30 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-amber-500/10 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 mb-1">
                    ⚠ Conflict Detected: {data.conflict_details?.type}
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200/80 mb-3">
                    {data.conflict_details?.description} <br />
                    <span className="font-semibold">Impact:</span>{" "}
                    {data.conflict_details?.impact}
                  </p>

                  <div className="p-3 bg-white/60 dark:bg-[#05050A]/50 rounded-xl border border-amber-200 dark:border-amber-500/20 text-sm font-medium text-slate-900 dark:text-white flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      🤖 AI Suggestion:
                    </span>
                    {data.conflict_details?.recommendation}
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <button
                    onClick={handleAcceptAISolution}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-none"
                  >
                    <Check className="w-5 h-5" /> Accept Solution
                  </button>
                  <button className="px-6 py-3 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold rounded-xl border border-slate-200 dark:border-white/10 transition-all cursor-none">
                    Manual Override
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Timeline */}
          <div
            className={`bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden transition-opacity duration-500 ${data.conflict_detected && !conflictResolved ? "opacity-50 pointer-events-none" : "opacity-100"}`}
          >
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  TechNova Solutions
                </h2>
                <p className="text-sm text-slate-500">
                  Proposed Interview Timeline
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                <ShieldCheck className="w-4 h-4" />
                {conflictResolved ? "Constraints Verified" : "Draft Mode"}
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Grouping by time blocks for visual clarity */}
              {["09:00", "10:00"].map((time) => {
                const slots = data.schedule.filter(
                  (s) => s.start_time === time,
                );
                if (slots.length === 0) return null;

                return (
                  <div key={time} className="relative">
                    <div className="sticky top-0 bg-white/90 dark:bg-[#0A0A12]/90 backdrop-blur-sm py-2 mb-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
                      <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {time} AM
                      </span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            slot.status === "conflict" && !conflictResolved
                              ? "bg-red-50 dark:bg-red-500/5 border-red-300 dark:border-red-500/30"
                              : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/30"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                {slot.student}
                              </h4>
                              <p className="text-sm text-slate-500 font-mono mt-1">
                                {slot.start_time} - {slot.end_time}
                              </p>
                            </div>
                            {slot.status === "conflict" &&
                              !conflictResolved && (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase rounded border border-red-200 dark:border-red-500/20">
                                  Conflict
                                </span>
                              )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-slate-900 dark:text-slate-300">
                                {slot.room}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <UsersRound className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-slate-900 dark:text-slate-300">
                                {slot.panel}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Finalization Footer */}
            <div
              className={`p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-end transition-opacity ${!data.conflict_detected || conflictResolved ? "opacity-100" : "opacity-50 pointer-events-none"}`}
            >
              <button className="flex items-center justify-center gap-2 py-3 px-8 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-none shadow-lg shadow-emerald-600/25">
                <Check className="w-5 h-5" /> Confirm Schedule & Notify Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}