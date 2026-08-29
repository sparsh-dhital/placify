// frontend/src/pages/panelist/Dashboard.tsx
import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Sparkles,
  User,
  AlertTriangle,
  Building2,
  Send,
} from "lucide-react";
import {
  getPanelInterviews,
  submitInterviewFeedback,
} from "../../services/api";
import type {
  PanelDashboardResponse,
  PanelInterview,
  FeedbackPayload,
} from "../../services/api";

export default function PanelistDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PanelDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeInterview, setActiveInterview] = useState<PanelInterview | null>(
    null,
  );
  const [technicalScore, setTechnicalScore] = useState<number>(0);
  const [communicationScore, setCommunicationScore] = useState<number>(0);
  const [problemSolvingScore, setProblemSolvingScore] = useState<number>(0);
  const [overallResult, setOverallResult] = useState<
    "pass" | "fail" | "hold" | ""
  >("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchInterviews = async () => {
    try {
      const result = await getPanelInterviews();
      const interviews = result?.interviews || [];
      setData({ ...result, interviews });

      if (interviews.length > 0) {
        setActiveInterview((current) => current ?? interviews[0]);
      } else {
        setActiveInterview(null);
      }
    } catch (err: any) {
      console.error("Panelist dashboard error:", err);
      setError(err.message || "Failed to load panelist interviews.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();

    const intervalId = window.setInterval(() => {
      fetchInterviews();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (data?.interviews?.length && !activeInterview) {
      setActiveInterview(data.interviews[0]);
    }
  }, [data, activeInterview]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterview) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const payload: FeedbackPayload = {
        interview_id: activeInterview.id,
        technical_score: Number(technicalScore),
        communication_score: Number(communicationScore),
        problem_solving_score: Number(problemSolvingScore),
        overall_result: overallResult,
        comments,
      };

      await submitInterviewFeedback(payload);
      setSuccessMessage(
        "Scorecard successfully recorded and synced with MongoDB.",
      );

      await fetchInterviews();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      console.error("Feedback submission error:", err);
      alert("Failed to submit feedback: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[#05050A]">
        <div className="w-16 h-16 rounded-full border-t-[3px] border-indigo-600 animate-spin mb-4 shadow-xl shadow-indigo-500/10"></div>
        <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm tracking-wider uppercase">
          Loading Panelist Roster...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200 dark:border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
          Panelist Sync Error
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
          {error || "Unable to fetch panelist interview roster."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4 sm:px-6 lg:px-8 mt-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Interview Evaluation Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome, {data.panelist_name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Evaluate candidate competencies and submit official placement
            scorecards in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-5 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-300 shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {data.interviews?.length || 0}{" "}
            Interviews Today
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roster List */}
        <section className="bg-white dark:bg-[#0A0A12] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl shadow-slate-900/5 space-y-4 h-fit">
          <h2 className="text-lg font-black text-slate-900 dark:text-white px-2">
            Today's Roster
          </h2>
          <div className="space-y-3">
            {data.interviews && data.interviews.length > 0 ? (
              data.interviews.map((interview: PanelInterview) => {
                const isSelected = activeInterview?.id === interview.id;
                const isCompleted = interview.status === "completed";

                return (
                  <div
                    key={interview.id}
                    onClick={() => setActiveInterview(interview)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 text-slate-900 dark:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">
                            {interview.candidate.name}
                          </h3>
                          <p
                            className={`text-xs ${
                              isSelected
                                ? "text-indigo-100"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {interview.company} • {interview.round}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          isCompleted
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {interview.status}
                      </span>
                    </div>

                    <div
                      className={`flex items-center justify-between text-xs font-semibold pt-2 border-t ${
                        isSelected
                          ? "border-white/20 text-indigo-100"
                          : "border-slate-200 dark:border-white/10 text-slate-500"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {interview.time}
                      </span>
                      <span>Room: {interview.room}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">
                No interviews assigned for today.
              </p>
            )}
          </div>
        </section>

        {/* Candidate Evaluation Form & Details */}
        <div className="lg:col-span-2 space-y-8">
          {activeInterview ? (
            <div className="bg-white dark:bg-[#0A0A12] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-slate-900/5 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Active Evaluation
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {activeInterview.candidate.name}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />{" "}
                      {activeInterview.candidate.branch}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg font-mono">
                      CGPA: {activeInterview.candidate.cgpa}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-4 py-2.5 rounded-2xl text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs">
                  <Building2 className="w-4 h-4" /> {activeInterview.company}
                </div>
              </div>

              {/* Candidate Skills & Projects Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                    Verified Skills Vector
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeInterview.candidate.skills?.map(
                      (skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl shadow-sm"
                        >
                          {skill}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                    Key Projects
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {activeInterview.candidate.projects?.map(
                      (proj: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-indigo-500">•</span> {proj}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>

              {/* Feedback Form */}
              <form
                onSubmit={handleFeedbackSubmit}
                className="space-y-6 pt-4 border-t border-slate-100 dark:border-white/5"
              >
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" /> Official
                  Scorecard
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Technical Score (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={technicalScore}
                      onChange={(e) =>
                        setTechnicalScore(Number(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Communication (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={communicationScore}
                      onChange={(e) =>
                        setCommunicationScore(Number(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Problem Solving (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={problemSolvingScore}
                      onChange={(e) =>
                        setProblemSolvingScore(Number(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Overall Interview Recommendation
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(["pass", "hold", "fail"] as const).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setOverallResult(res)}
                        className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          overallResult === res
                            ? res === "pass"
                              ? "bg-emerald-600 border-emerald-500 text-white shadow-md"
                              : res === "hold"
                                ? "bg-amber-600 border-amber-500 text-white shadow-md"
                                : "bg-rose-600 border-rose-500 text-white shadow-md"
                            : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Panelist Comments & Notes
                  </label>
                  <textarea
                    rows={4}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide constructive notes on system design approach, code quality, and communication..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-inner"
                    required
                  />
                </div>

                {successMessage && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5" /> {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/25 active:scale-95 cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Official Scorecard <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0A0A12] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-12 text-center text-slate-400 shadow-xl">
              Select an interview from the roster to begin candidate evaluation.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
