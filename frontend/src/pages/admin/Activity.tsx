// frontend/src/pages/admin/Activity.tsx
import { useState, useEffect } from "react";
import { Bot, User, AlertTriangle, ShieldCheck, Clock } from "lucide-react";
import { apiGet } from "../../services/api";

interface AuditLog {
  id: string;
  time: string;
  agent_name: string;
  type: "agent" | "human" | "system" | "exception";
  action: string;
  details: string;
}

export default function Activity() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/admin/audit-logs")
      .then((res: { success: boolean; logs: AuditLog[] }) => {
        if (res.success) {
          setLogs(res.logs || []);
        }
      })
      .catch((err) => console.error("Failed to fetch audit logs:", err))
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (type: AuditLog["type"]) => {
    switch (type) {
      case "agent":
        return <Bot className="w-4 h-4 text-indigo-500" />;
      case "human":
        return <User className="w-4 h-4 text-emerald-500" />;
      case "exception":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-cyan-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-500 font-medium">
        Synchronizing immutable audit logs...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-7 h-7 text-indigo-500" aria-hidden="true" />
          Agent Activity & Audit Trail
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-xl">
          Immutable log of all autonomous agent decisions, human overrides, and
          operational exceptions.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5">
        <div
          className="relative border-l border-slate-200 dark:border-white/10 ml-4 space-y-8 py-2"
          role="feed"
        >
          {logs.map((log) => (
            <div key={log.id} className="relative pl-8 group" role="article">
              <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-white dark:bg-[#05050A] border border-slate-200 dark:border-white/20 flex items-center justify-center shadow-sm">
                {getIcon(log.type)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    {log.time}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    {log.agent_name}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                  {log.action}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {log.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}