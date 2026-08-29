// frontend/src/pages/admin/Exceptions.tsx
import { useState, useEffect } from "react";
import { ShieldAlert, Bot, ArrowRight, CheckCircle2 } from "lucide-react";
import { apiGet, apiPost } from "../../services/api";

interface ExceptionItem {
  id: string;
  severity: "high" | "medium" | "low";
  resource: string;
  description: string;
  impact: string;
  recommendation: string;
  confidence: number;
  status: "pending" | "resolved";
}

export default function Exceptions() {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExceptions = async () => {
    try {
      const res = (await apiGet("/admin/exceptions")) as {
        success: boolean;
        exceptions: ExceptionItem[];
      };
      if (res.success) {
        setExceptions(res.exceptions || []);
      }
    } catch (err) {
      console.error("Failed to fetch exceptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await apiPost(`/admin/exceptions/${id}/resolve`, {});
      setExceptions((prev) =>
        prev.map((ex) => (ex.id === id ? { ...ex, status: "resolved" } : ex)),
      );
    } catch (err) {
      console.error("Failed to resolve exception:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-500 font-medium">
        Loading exception control center from MongoDB...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-red-500" aria-hidden="true" />
          Exception Control Center
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-xl">
          Real-time monitoring of placement disruptions. Review AI recovery
          plans and execute resolutions instantly.
        </p>
      </div>

      <div className="space-y-4" role="list">
        {exceptions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#0A0A12]/80 rounded-[2rem] border border-slate-200 dark:border-white/10 text-slate-500">
            No active operational exceptions or conflicts detected. All systems
            optimal.
          </div>
        ) : (
          exceptions.map((ex) => {
            const isResolved = ex.status === "resolved";
            const isHigh = ex.severity === "high";

            return (
              <div
                key={ex.id}
                className={`p-6 sm:p-8 rounded-[2rem] border transition-all ${
                  isResolved
                    ? "bg-slate-50 dark:bg-[#0A0A12]/40 border-slate-200 dark:border-white/5 opacity-60"
                    : isHigh
                      ? "bg-white dark:bg-[#0A0A12]/90 border-red-200 dark:border-red-500/30 shadow-xl shadow-red-500/5"
                      : "bg-white dark:bg-[#0A0A12]/90 border-amber-200 dark:border-amber-500/30 shadow-xl shadow-amber-500/5"
                }`}
                role="listitem"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isHigh
                            ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                            : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                        }`}
                      >
                        {ex.severity} Severity
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {ex.resource}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {ex.description}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Impact:
                      </span>{" "}
                      {ex.impact}
                    </p>

                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-2">
                      <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div className="text-sm text-indigo-900 dark:text-indigo-200">
                        <span className="font-bold">
                          AI Recommendation ({Math.round(ex.confidence * 100)}%
                          confidence):
                        </span>{" "}
                        {ex.recommendation}
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end gap-2 shrink-0">
                    {isResolved ? (
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl">
                        <CheckCircle2 className="w-4 h-4" /> Resolved & Executed
                      </div>
                    ) : (
                      <button
                        onClick={() => handleResolve(ex.id)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 cursor-none"
                      >
                        Approve Solution <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}