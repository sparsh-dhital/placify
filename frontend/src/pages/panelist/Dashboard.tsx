// src/pages/panelist/Dashboard.tsx
import { useState } from "react";
import {
  User,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Send,
  Star,
  Wand2,
  Building,
  AlertCircle,
} from "lucide-react";

export default function PanelistDashboard() {
  const [selectedCandidate, setSelectedCandidate] = useState<string>("c1");
  const [verdict, setVerdict] = useState<"Hire" | "Reject" | "Hold" | null>(
    null,
  );
  const [techScore, setTechScore] = useState(4);
  const [notes, setNotes] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [reportedIssue, setReportedIssue] = useState(false);

  const schedule = [
    {
      id: "c1",
      name: "Aarav Mehta",
      time: "09:00 AM",
      status: "pending",
      room: "Lab 2",
      cgpa: 8.7,
      branch: "CSE",
      skills: ["Python", "SQL", "React"],
    },
    {
      id: "c2",
      name: "Ananya Sharma",
      time: "10:00 AM",
      status: "pending",
      room: "Lab 2",
      cgpa: 9.1,
      branch: "CSE",
      skills: ["Python", "AWS", "Git"],
    },
    {
      id: "c3",
      name: "Sneha Patel",
      time: "11:00 AM",
      status: "completed",
      room: "Lab 2",
      cgpa: 8.2,
      branch: "ECE",
      skills: ["Java", "SQL"],
    },
  ];

  const current =
    schedule.find((s) => s.id === selectedCandidate) || schedule[0];

  const handleAISynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setNotes(
        `AI Synthesized Summary for ${current.name}:\n• Strong grasp of core data structures and ${current.skills[0]} fundamentals.\n• Communicated problem-solving approach clearly.\n• Recommended Verdict: Strong Hire for Technical Round 2.`,
      );
      setTechScore(5);
      setVerdict("Hire");
      setIsSynthesizing(false);
    }, 1200);
  };

  return (
    <main className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16 relative">
      {/* Ambient Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none rounded-full hidden dark:block" />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl relative z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Panelist Workspace
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Technical Round 1 • TechNova Solutions
          </p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Today&apos;s Roster: 2 Remaining
        </div>
      </header>

      {/* Main Grid with Generous Spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column: Schedule Sidebar & Venue Status Widget */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl p-6 sm:p-8 flex flex-col h-fit">
            <div className="border-b border-slate-200 dark:border-white/10 pb-4 mb-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Interview Roster
              </h2>
            </div>
            <div className="space-y-3">
              {schedule.map((cand) => (
                <button
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-none ${
                    selectedCandidate === cand.id
                      ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500/50 shadow-md"
                      : "bg-transparent border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {cand.name}
                    </span>
                    {cand.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono">
                        {cand.time}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" /> {cand.room}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Venue Status & Exception Widget */}
          <section className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-500" /> Venue Status
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <p className="flex justify-between">
                <span>Assigned Room:</span>{" "}
                <strong className="text-slate-900 dark:text-white">
                  Lab 2
                </strong>
              </p>
              <p className="flex justify-between">
                <span>Wi-Fi Status:</span>{" "}
                <strong className="text-emerald-500">Stable (100 Mbps)</strong>
              </p>
              <p className="flex justify-between">
                <span>TPO Support Desk:</span>{" "}
                <strong className="text-indigo-500">Ext. 402</strong>
              </p>
            </div>

            <button
              onClick={() => setReportedIssue(true)}
              className="w-full mt-2 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-none"
            >
              <AlertCircle className="w-4 h-4" />{" "}
              {reportedIssue ? "Issue Logged to Admin" : "Report Venue Issue"}
            </button>
          </section>
        </div>

        {/* Evaluation Center */}
        <section className="lg:col-span-2 bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 flex flex-col shadow-xl">
          <div className="border-b border-slate-200 dark:border-white/10 pb-6 mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <User className="w-6 h-6 text-indigo-500" /> {current.name}
              </h2>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                  CGPA: {current.cgpa}
                </span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                  {current.branch}
                </span>
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white text-sm font-bold rounded-xl transition-colors cursor-none">
              <FileText className="w-4 h-4" /> View CV
            </button>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Pre-Interview AI Context
                </h3>
                <button
                  onClick={handleAISynthesize}
                  disabled={isSynthesizing}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-none"
                >
                  <Wand2 className="w-3.5 h-3.5" />{" "}
                  {isSynthesizing ? "Synthesizing..." : "AI Synthesize Notes"}
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Candidate exhibits strong problem-solving proficiencies in{" "}
                {current.skills.join(", ")}.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Technical Score (1-5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setTechScore(star)}
                    className={`p-3 rounded-xl border transition-colors cursor-none ${
                      star <= techScore
                        ? "bg-amber-500/10 border-amber-500 text-amber-400"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400"
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Panel Verdict
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["Hire", "Hold", "Reject"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setVerdict(opt)}
                    className={`py-3 text-sm font-bold rounded-xl border transition-all cursor-none ${
                      verdict === opt
                        ? opt === "Hire"
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-lg"
                          : opt === "Reject"
                            ? "bg-red-500 text-white border-red-600 shadow-lg"
                            : "bg-amber-500 text-white border-amber-600 shadow-lg"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Interviewer Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type observations or click AI Synthesize Notes..."
                className="w-full h-28 p-3.5 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none cursor-none"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-none">
              <Send className="w-4 h-4" /> Submit Official Evaluation
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}