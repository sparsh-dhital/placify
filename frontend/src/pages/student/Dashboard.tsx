// src/pages/student/Dashboard.tsx
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  User,
  Target,
  Calendar,
  MapPin,
  UsersRound,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { getStudentDashboard, parseStudentResume } from "../../services/api";
import type {
  ResumeMatchResult,
  StudentDashboardResponse,
} from "../../services/api";
import { AICritic } from "../../components/ui/AICritic"; // <-- AI Critic Imported

export default function StudentDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [resumeResult, setResumeResult] = useState<ResumeMatchResult | null>(
    null,
  );
  const [isParsing, setIsParsing] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [parseError, setParseError] = useState<string>("");
  const displayedProfile = resumeResult?.parsed;

  // Hardcoded student ID for demonstration
  const activeStudentId = "s1";

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setParseError("");
    setIsParsing(true);

    try {
      const result = await parseStudentResume(file, {
        company: "TechNova Solutions",
        role: "Software Engineer",
        matched_skills: ["Python", "SQL", "Git", "React"],
        missing_skills: ["Docker"],
      });
      setResumeResult(result);
    } catch (error) {
      console.error("Resume parsing failed:", error);
      setResumeResult(null);
      setParseError(
        error instanceof Error
          ? error.message
          : "Unable to parse this file. Try a clearer PDF or image.",
      );
    } finally {
      setIsParsing(false);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getStudentDashboard(activeStudentId, true);
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Loading your placement profile...
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <main
      className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      aria-label="Student Placement Dashboard"
    >
      {/* Header & Readiness Score */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-500/30">
            <User
              className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome, {displayedProfile?.name || data.profile.name} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">
              {displayedProfile?.education[0] || data.profile.branch} • Email:{" "}
              {displayedProfile?.email || "Not uploaded"} • CGPA:{" "}
              {displayedProfile?.cgpa ?? data.profile.cgpa}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm w-full md:w-64">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Placement Readiness
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {data.profile.readiness_score}%
            </span>
          </div>
          <div
            className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden"
            role="progressbar"
            aria-valuenow={data.profile.readiness_score}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="bg-emerald-500 h-2.5 rounded-full"
              style={{ width: `${data.profile.readiness_score}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interviews & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Interview */}
          {data.upcoming_interview && (
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
                    <Calendar className="w-3.5 h-3.5" /> Upcoming Interview
                  </div>
                  <h2 className="text-2xl font-bold mb-1">
                    {data.upcoming_interview.company}
                  </h2>
                  <p className="text-indigo-100 font-medium">
                    {data.upcoming_interview.role}
                  </p>
                </div>

                <div className="flex flex-col gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl w-full md:w-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-100 uppercase tracking-wider font-semibold">
                        Location
                      </p>
                      <p className="font-bold">
                        {data.upcoming_interview.room}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-100 uppercase tracking-wider font-semibold">
                        Date & Time
                      </p>
                      <p className="font-bold">
                        {data.upcoming_interview.date},{" "}
                        {data.upcoming_interview.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2 text-sm font-medium text-indigo-100">
                  <UsersRound className="w-4 h-4" />{" "}
                  {data.upcoming_interview.panel}
                </div>
                <button className="px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-none">
                  View Details
                </button>
              </div>
            </div>
          )}

          {/* Job Matches */}
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" /> Available
                Opportunities
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {data.job_matches.map((match, idx) => {
                const isHighMatch = match.match_score >= 80;
                return (
                  <div
                    key={idx}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-none"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {match.company}
                        </h3>
                        <p className="text-sm text-slate-500">{match.role}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-xl border text-sm font-bold font-mono flex items-center gap-1.5 ${
                          isHighMatch
                            ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                        }`}
                      >
                        {isHighMatch && <CheckCircle2 className="w-4 h-4" />}
                        {match.match_score}% Match
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Matched Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {match.matched_skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {match.missing_skills.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Missing Skills
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {match.missing_skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-xs font-semibold rounded flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" /> {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Skill Gaps */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 p-6 sticky top-24">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit
                className="w-4 h-4 text-indigo-500"
                aria-hidden="true"
              />
              AI Recommendations
            </h3>

            <div className="space-y-4" role="list">
              {data.ai_recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5"
                  role="listitem"
                >
                  <div className="mt-0.5 shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="w-full">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                    Resume Eligibility Check
                  </h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                    Upload your latest resume to parse skills, check matching
                    requirements, and compute eligibility score.
                  </p>

                  <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-indigo-300 bg-white px-3 py-3 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-50 dark:bg-[#0A0A12] dark:text-indigo-300">
                    <input
                      type="file"
                      accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={handleResumeUpload}
                    />
                    {isParsing ? "Parsing resume..." : "Upload Resume"}
                  </label>

                  {selectedFileName && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      Selected: {selectedFileName}
                    </p>
                  )}
                  {parseError && (
                    <p
                      className="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {parseError}
                    </p>
                  )}
                </div>
              </div>

              {resumeResult && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#05050A]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {resumeResult.company}
                      </p>
                      <h5 className="text-lg font-bold text-slate-900 dark:text-white">
                        {resumeResult.role}
                      </h5>
                    </div>
                    <div
                      className={`rounded-xl border px-2.5 py-1.5 text-sm font-bold ${
                        resumeResult.eligibility_status === "Eligible"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : resumeResult.eligibility_status === "Borderline"
                            ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
                            : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                      }`}
                    >
                      {resumeResult.eligibility_score}%
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Matched Skills
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {resumeResult.matched_skills.length ? (
                          resumeResult.matched_skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            No direct matches found
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Missing Skills
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {resumeResult.missing_skills.length ? (
                          resumeResult.missing_skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            No critical gaps
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#0A0A12]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Extracted Candidate Info
                    </p>
                    <div className="mt-2 grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <p>
                        <span className="font-semibold">Name:</span>{" "}
                        {resumeResult.parsed.name}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {resumeResult.parsed.email}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {resumeResult.parsed.phone}
                      </p>
                      <p>
                        <span className="font-semibold">CGPA:</span>{" "}
                        {resumeResult.parsed.cgpa ?? "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Skills:</span>{" "}
                        {resumeResult.parsed.skills.join(", ") ||
                          "No skills detected"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Requirement Match Summary
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {resumeResult.reasons.map((reason) => (
                        <li key={reason} className="list-disc pl-5">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Floating Groq-powered AI Critic */}
      <AICritic />
    </main>
  );
}
