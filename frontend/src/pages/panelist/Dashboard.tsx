// src/pages/panelist/Dashboard.tsx
import { useState, useEffect } from "react";
import {
  User,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  MessageSquare,
  Send,
  Star,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import {
  getPanelInterviews,
  submitInterviewFeedback,
  PanelDashboardResponse,
  PanelInterview,
} from "../../services/api";

export default function PanelistDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<PanelDashboardResponse | null>(null);
  const [selectedInterview, setSelectedInterview] =
    useState<PanelInterview | null>(null);

  // Feedback Form State
  const [techScore, setTechScore] = useState(0);
  const [commScore, setCommScore] = useState(0);
  const [probScore, setProbScore] = useState(0);
  const [result, setResult] = useState<"pass" | "fail" | "hold" | "">("");
  const [comments, setComments] = useState("");

  // Hardcoded panelist ID for demonstration
  const activePanelistId = "p1";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getPanelInterviews(activePanelistId, true);
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleSelectInterview = (interview: PanelInterview) => {
    setSelectedInterview(interview);
    // Reset form when changing candidate
    setTechScore(0);
    setCommScore(0);
    setProbScore(0);
    setResult("");
    setComments("");
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview || !result) return;

    setIsSubmitting(true);
    try {
      const payload = {
        interview_id: selectedInterview.id,
        technical_score: techScore,
        communication_score: commScore,
        problem_solving_score: probScore,
        overall_result: result,
        comments,
      };

      const res = await submitInterviewFeedback(payload, true);
      alert(res.message);

      // Update local state to mark as completed
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          interviews: prev.interviews.map((i) =>
            i.id === selectedInterview.id ? { ...i, status: "completed" } : i,
          ),
        };
      });
      setSelectedInterview(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper component for Star Rating
  const StarRating = ({
    label,
    score,
    setScore,
  }: {
    label: string;
    score: number;
    setScore: (val: number) => void;
  }) => {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-sm transition-transform hover:scale-110 cursor-none"
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  star <= score
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-slate-300 dark:text-slate-600"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Loading today's schedule...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const pendingCount = data.interviews.filter(
    (i) => i.status === "pending",
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Good Morning, {data.panelist_name} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm font-medium">
            You have {pendingCount} interviews remaining today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Today's
              Interviews
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {data.interviews.map((interview) => (
              <div
                key={interview.id}
                onClick={() => handleSelectInterview(interview)}
                className={`group p-4 rounded-2xl border transition-all cursor-none flex flex-col gap-3 ${
                  selectedInterview?.id === interview.id
                    ? "bg-slate-50 dark:bg-white/5 border-indigo-500/50 shadow-md"
                    : "bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:border-indigo-500/30"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {interview.candidate.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {interview.company} • {interview.round}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      interview.status === "completed"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                    }`}
                  >
                    {interview.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {interview.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {interview.room}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Candidate Profile & Feedback Form */}
        <div className="lg:col-span-2">
          {selectedInterview ? (
            <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden animate-in fade-in h-[calc(100vh-12rem)] flex flex-col">
              {/* Candidate Info Header */}
              <div className="p-6 md:p-8 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedInterview.candidate.name}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                      {selectedInterview.candidate.branch} • CGPA:{" "}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedInterview.candidate.cgpa}
                      </span>
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white text-sm font-semibold rounded-xl transition-colors cursor-none">
                    <FileText className="w-4 h-4" /> View Resume
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {selectedInterview.candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Evaluation Form */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {selectedInterview.status === "completed" ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      Evaluation Submitted
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                      You have already submitted the feedback for{" "}
                      {selectedInterview.candidate.name}.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmitFeedback}
                    className="space-y-8 max-w-2xl mx-auto"
                  >
                    {/* Score section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Star className="w-4 h-4 text-indigo-500" /> Technical &
                        Soft Skills
                      </h3>
                      <StarRating
                        label="Technical Knowledge"
                        score={techScore}
                        setScore={setTechScore}
                      />
                      <StarRating
                        label="Communication & Articulation"
                        score={commScore}
                        setScore={setCommScore}
                      />
                      <StarRating
                        label="Problem Solving Approach"
                        score={probScore}
                        setScore={setProbScore}
                      />
                    </div>

                    {/* Overall Decision */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-500" />{" "}
                        Overall Result
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {(["pass", "fail", "hold"] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setResult(r)}
                            className={`py-3 px-4 rounded-xl text-sm font-bold capitalize transition-all cursor-none border ${
                              result === r
                                ? r === "pass"
                                  ? "bg-emerald-500 text-white border-emerald-600 shadow-md"
                                  : r === "fail"
                                    ? "bg-red-500 text-white border-red-600 shadow-md"
                                    : "bg-amber-500 text-white border-amber-600 shadow-md"
                                : "bg-slate-50 dark:bg-[#05050A] text-slate-500 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-500" />{" "}
                        Interviewer Notes
                      </h3>
                      <textarea
                        required
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Detail the candidate's strengths, weaknesses, and reasoning for your overall result..."
                        className="w-full min-h-[120px] p-4 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none cursor-none shadow-inner"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !result ||
                        techScore === 0 ||
                        commScore === 0 ||
                        probScore === 0 ||
                        !comments
                      }
                      className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-2xl hover:scale-[1.01] active:scale-95 transition-all cursor-none shadow-xl shadow-indigo-600/25"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isSubmitting
                        ? "Submitting to Placify..."
                        : "Submit Official Feedback"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-12rem)] bg-white dark:bg-[#0A0A12]/50 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-center opacity-70">
              <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No Candidate Selected
              </h3>
              <p className="text-sm text-slate-500">
                Select an upcoming interview from the timeline to begin the
                evaluation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
