// src/pages/admin/Activity.tsx
import {
  Bot,
  User,
  AlertTriangle,
  ShieldCheck,
  Clock,
} from "lucide-react";

interface AuditLog {
  id: string;
  time: string;
  agent_name: string;
  type: "agent" | "human" | "system" | "exception";
  action: string;
  details: string;
}

export default function Activity() {
  const logs: AuditLog[] = [
    {
      id: "l1",
      time: "10:17 AM",
      agent_name: "Admin (TPO)",
      type: "human",
      action: "Approved recovery plan",
      details: "Moved TechNova interviews from Room 101 to Room 201.",
    },
    {
      id: "l2",
      time: "10:16 AM",
      agent_name: "Scheduler Agent",
      type: "agent",
      action: "Generated recovery plan",
      details:
        "Calculated alternative room availability for 3 affected candidates.",
    },
    {
      id: "l3",
      time: "10:15 AM",
      agent_name: "Exception Agent",
      type: "exception",
      action: "Detected Room 101 delay",
      details: "Flagged high severity operational bottleneck.",
    },
    {
      id: "l4",
      time: "10:12 AM",
      agent_name: "Scheduler Agent",
      type: "agent",
      action: "Generated interview schedule",
      details: "Allocated rooms and panels while respecting hard constraints.",
    },
    {
      id: "l5",
      time: "10:10 AM",
      agent_name: "Admin (TPO)",
      type: "human",
      action: "Approved shortlist",
      details: "Finalized candidate pool for TechNova Solutions.",
    },
    {
      id: "l6",
      time: "10:07 AM",
      agent_name: "Matchmaker Agent",
      type: "agent",
      action: "Generated candidate matches",
      details: "Scored 10 eligible students using skill vector comparison.",
    },
    {
      id: "l7",
      time: "10:05 AM",
      agent_name: "Eligibility Agent",
      type: "agent",
      action: "Checked 15 students",
      details: "Filtered candidates based on CGPA >= 7.5 and 0 backlogs.",
    },
    {
      id: "l8",
      time: "10:02 AM",
      agent_name: "JD Analyzer Agent",
      type: "agent",
      action: "Analyzed TechNova JD",
      details: "Extracted structured requirements with 92% confidence.",
    },
  ];

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
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

      {/* Timeline */}
      <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5">
        <div
          className="relative border-l border-slate-200 dark:border-white/10 ml-4 space-y-8 py-2"
          role="feed"
        >
          {logs.map((log) => (
            <div key={log.id} className="relative pl-8 group" role="article">
              {/* Timeline Node Icon */}
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