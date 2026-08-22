// src/pages/admin/Shortlist.tsx
import { useState, useEffect } from "react";
import {
  UserCheck,
  ShieldAlert,
  Check,
  X,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
  generateMatches,
  submitShortlistApproval,
} from "../../services/api";
import type { MatchResponse, ShortlistDecision } from "../../services/api";

export default function Shortlist() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<MatchResponse | null>(null);

  // Track decisions: key is student_id, value is the decision object
  const [decisions, setDecisions] = useState<Record<string, ShortlistDecision>>(
    {},
  );

  const activeJobId = "20000000-0000-0000-0000-000000000001";

  // Fetch initial AI recommendations on mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const result = await generateMatches(activeJobId, true);
        setData(result);

        // Auto-approve candidates with a score > 75 to save time, others default to reject
        const initialDecisions: Record<string, ShortlistDecision> = {};
        result.matches.forEach((match) => {
          initialDecisions[match.student_id] = {
            student_id: match.student_id,
            action: match.match_score >= 75 ? "approve" : "reject",
            override_reason: "",
          };
        });
        setDecisions(initialDecisions);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleToggleDecision = (
    studentId: string,
    action: "approve" | "reject",
  ) => {
    setDecisions((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        action,
        // Clear reason if reverting back to AI recommendation patterns
        override_reason:
          action === "approve" ? "" : prev[studentId].override_reason,
      },
    }));
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setDecisions((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        override_reason: reason,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = Object.values(decisions);
      const result = await submitShortlistApproval(activeJobId, payload, true);
      alert(
        `Success! ${result.message}\nApproved: ${result.approved_count}\nRejected: ${result.rejected_count}`,
      );
      // In a real app, navigate to the Interview Scheduler next
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedCount = Object.values(decisions).filter(
    (d) => d.action === "approve",
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Loading AI Recommendations...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-indigo-500" aria-hidden="true" />
            Human Shortlist Approval
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-xl">
            Review the AI Matchmaker's recommendations. You have absolute
            executive control to approve or override candidate selections before
            scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
            {approvedCount} Approved
          </span>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {data?.company}
          </h2>
          <p className="text-sm text-slate-500">
            {data?.job} • Initial AI Recommendations
          </p>
        </div>

        <div
          className="divide-y divide-slate-100 dark:divide-white/5"
          role="list"
        >
          {data?.matches.map((match) => {
            const decision = decisions[match.student_id];
            const isApproved = decision?.action === "approve";
            const isHighMatch = match.match_score >= 80;

            return (
              <div
                key={match.student_id}
                className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                role="listitem"
              >
                {/* Candidate Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {match.student_name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                        isHighMatch
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                      }`}
                    >
                      {match.match_score}% Match
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">AI Logic:</span>{" "}
                    {match.explanation}
                  </p>
                </div>

                {/* Action Controls */}
                <div className="w-full md:w-auto flex flex-col gap-3">
                  <div
                    className="flex p-1 bg-slate-100 dark:bg-[#05050A] rounded-xl border border-slate-200 dark:border-white/10"
                    role="radiogroup"
                    aria-label={`Decision for ${match.student_name}`}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isApproved}
                      onClick={() =>
                        handleToggleDecision(match.student_id, "approve")
                      }
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        isApproved
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={!isApproved}
                      onClick={() =>
                        handleToggleDecision(match.student_id, "reject")
                      }
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                        !isApproved
                          ? "bg-red-500 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>

                  {/* Override Reason Input (Appears if AI recommended high score, but admin rejects) */}
                  {!isApproved && isHighMatch && (
                    <div className="relative animate-in slide-in-from-top-2 duration-300">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldAlert
                          className="h-4 w-4 text-amber-500"
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        type="text"
                        value={decision.override_reason || ""}
                        onChange={(e) =>
                          handleReasonChange(match.student_id, e.target.value)
                        }
                        placeholder="Reason for overriding AI..."
                        required
                        aria-required="true"
                        aria-label="Override reason"
                        className="w-full pl-9 pr-3 py-2 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs text-slate-900 dark:text-white placeholder-amber-600/50 dark:placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Approvals are recorded in the immutable audit log.
          </p>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:scale-[1.02] active:scale-95 transition-all cursor-none shadow-lg shadow-indigo-600/25"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 rounded-full border-t-2 border-white animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" aria-hidden="true" />
            )}
            {isSubmitting
              ? "Saving Audit Log..."
              : "Confirm Shortlist & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}