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
  UploadCloud,
} from "lucide-react";
import {
  getStudentDashboard,
  parseStudentResume,
  API_URL,
} from "../../services/api";
import type {
  ResumeMatchResult,
  StudentDashboardResponse,
} from "../../services/api";
import { AICritic } from "../../components/ui/AICritic";

export default function StudentDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [resumeResult, setResumeResult] = useState<ResumeMatchResult | null>(
    null,
  );
  const [dynamicRecs, setDynamicRecs] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [parseError, setParseError] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("Not uploaded");

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

      const newRecs = [];
      if (result.missing_skills.length > 0) {
        newRecs.push(
          `Skill Gap Detected: You are missing ${result.missing_skills.join(", ")}. Focus on these areas to improve your overall match rate.`,
        );
      }
      if (result.eligibility_score < 75) {
        newRecs.push(
          `Your eligibility score is ${result.eligibility_score}%. Ensure your resume explicitly details relevant backend frameworks or tools.`,
        );
      } else {
        newRecs.push(
          "Your profile is highly optimized for this role. Prepare for technical rounds by reviewing standard algorithms.",
        );
      }
      setDynamicRecs(newRecs);

      const token = localStorage.getItem("placify_token");
      await fetch(`${API_URL}/student/sync-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          cgpa: result.parsed.cgpa,
          skills: result.parsed.skills,
          readiness_score: result.eligibility_score,
        }),
      });

      const updatedData = await getStudentDashboard();
      setData(updatedData);
    } catch (error) {
      console.error("Parsing failed:", error);
      setResumeResult(null);
      setParseError(
        error instanceof Error ? error.message : "Unable to parse this file.",
      );
    } finally {
      setIsParsing(false);
    }
  };

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("placify_user") || "{}");
      if (user && user.email) setUserEmail(user.email);
    } catch (e) {
      console.error(e);
    }

    const fetchDashboard = async () => {
      try {
        const result = await getStudentDashboard();
        setData(result);
        setDynamicRecs(result.ai_recommendations);
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
        <p className="text-slate-500 font-medium">
          Loading your placement profile...
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* 1. Header Banner - STRICTLY TIED TO AUTH/DB */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-500/30">
            <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Welcome, {data.profile.name} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">
              {data.profile.branch} &nbsp;•&nbsp; Email: {userEmail}{" "}
              &nbsp;•&nbsp; CGPA: {data.profile.cgpa}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm w-full md:w-64">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Readiness Score
            </span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {resumeResult?.eligibility_score ?? data.profile.readiness_score}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000"
              style={{
                width: `${resumeResult?.eligibility_score ?? data.profile.readiness_score}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. CENTERED HERO UPLOAD SECTION */}
      <div className="w-full bg-white dark:bg-[#0A0A12] border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 rounded-[2rem] p-8 sm:p-14 text-center shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-colors">
        <UploadCloud className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Resume Eligibility Engine
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto text-sm">
          Upload your latest resume to parse skills, check matching
          requirements, and instantly compute your eligibility score.
        </p>

        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 text-sm font-bold text-white transition shadow-lg shadow-indigo-600/20 active:scale-95">
          <input
            type="file"
            accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleResumeUpload}
            disabled={isParsing}
          />
          {isParsing ? "Parsing Document..." : "Upload Resume to Scan"}
        </label>

        {selectedFileName && (
          <p className="mt-5 text-xs font-medium text-slate-600 dark:text-slate-300">
            Selected File: {selectedFileName}
          </p>
        )}
        {parseError && (
          <p className="mt-3 text-xs font-bold text-red-500">{parseError}</p>
        )}
      </div>

      {/* 3. PARSED RESULTS SUMMARY */}
      {resumeResult && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-[#0A0A12] shadow-xl shadow-slate-900/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-white/5 pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {resumeResult.company}
              </p>
              <h5 className="text-xl font-bold text-slate-900 dark:text-white">
                {resumeResult.role} Match Result
              </h5>
            </div>
            <div
              className={`rounded-xl border px-5 py-2.5 text-xl font-bold ${resumeResult.eligibility_status === "Eligible" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20" : resumeResult.eligibility_status === "Borderline" ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20" : "border-red-200 bg-red-50 text-red-700 dark:bg-red-500/10 dark:border-red-500/20"}`}
            >
              {resumeResult.eligibility_score}% Match
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 mb-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Verified Skills (Match)
              </p>
              <div className="flex flex-wrap gap-2">
                {resumeResult.matched_skills.length ? (
                  resumeResult.matched_skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">
                    No direct matches found
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Missing Requirements
              </p>
              <div className="flex flex-wrap gap-2">
                {resumeResult.missing_skills.length ? (
                  resumeResult.missing_skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-red-100 dark:bg-red-500/20 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">
                    No critical gaps detected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/5 dark:bg-[#05050A]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Extracted Candidate Profile Data
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Name:{" "}
              <strong className="text-slate-900 dark:text-white">
                {resumeResult.parsed.name}
              </strong>{" "}
              &nbsp;•&nbsp; Email:{" "}
              <strong className="text-slate-900 dark:text-white">
                {resumeResult.parsed.email}
              </strong>{" "}
              &nbsp;•&nbsp; CGPA:{" "}
              <strong className="text-slate-900 dark:text-white">
                {resumeResult.parsed.cgpa ?? "N/A"}
              </strong>
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
              Parsed Education:{" "}
              <strong className="text-slate-900 dark:text-white">
                {resumeResult.parsed.education.join(" • ") || "None detected"}
              </strong>
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
              Parsed Skills:{" "}
              {resumeResult.parsed.skills.join(", ") || "None detected"}
            </p>
          </div>
        </div>
      )}

      {/* 4. BOTTOM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 border border-indigo-500 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-indigo-600/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6 relative z-10">
            <Target className="w-5 h-5 text-indigo-200" /> Active Opportunities
          </h2>

          <div className="space-y-4 relative z-10">
            {data.job_matches.map((match, idx) => {
              const isHighMatch = match.match_score >= 80;
              return (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-sm hover:bg-white/20 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:translate-x-1 transition-transform">
                        {match.company}
                      </h3>
                      <p className="text-sm font-medium text-indigo-100">
                        {match.role}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${isHighMatch ? "text-emerald-300 bg-emerald-900/40 border-emerald-500/30" : "text-amber-300 bg-amber-900/40 border-amber-500/30"}`}
                    >
                      {isHighMatch && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {match.match_score}% Match
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4 border-t border-white/10 pt-4">
                    {match.matched_skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-white/20 text-white text-[10px] uppercase tracking-wider font-bold rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500" /> Actionable
            Insights
          </h3>
          <div className="space-y-4">
            {dynamicRecs.map((rec, idx) => (
              <div
                key={idx}
                className="flex gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5"
              >
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AICritic />
    </main>
  );
}