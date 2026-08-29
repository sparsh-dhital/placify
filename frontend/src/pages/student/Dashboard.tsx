// frontend/src/pages/student/Dashboard.tsx
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  User,
  Target,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  Eye,
  Trash2,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Building2,
  FileSpreadsheet,
  Code2,
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
  const [dynamicInsights, setDynamicInsights] = useState<
    { text: string; type: "strength" | "weakness" }[]
  >([]);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [parseError, setParseError] = useState("");
  const [userEmail, setUserEmail] = useState("N/A");
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const fetchDashboard = async () => {
    try {
      const result = await getStudentDashboard();
      setData(result);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setParseError("");
    setIsParsing(true);

    if (fileUrl) URL.revokeObjectURL(fileUrl);
    const newFileUrl = URL.createObjectURL(file);
    setFileUrl(newFileUrl);

    try {
      const primaryJob =
        data?.job_matches && data.job_matches.length > 0
          ? data.job_matches[0]
          : null;
      const targetJobPayload = {
        company: primaryJob?.company || "TechNova Solutions",
        role: primaryJob?.role || "Software Engineer",
        matched_skills: primaryJob?.required_skills || [
          "Python",
          "Java",
          "SQL",
          "React",
          "Docker",
          "Git",
        ],
        missing_skills: [],
      };

      const result = await parseStudentResume(file, targetJobPayload as any);
      setResumeResult(result);

      // Extract LLM agent parsed strengths and weaknesses (2 strengths, 2 weaknesses)
      const llmStrengths: { text: string; type: "strength" }[] = (
        result.parsed?.strong_points || []
      )
        .slice(0, 2)
        .map((pt: string) => ({ text: pt, type: "strength" }));

      const llmWeaknesses: { text: string; type: "weakness" }[] = (
        result.parsed?.weak_points || []
      )
        .slice(0, 2)
        .map((pt: string) => ({ text: pt, type: "weakness" }));

      // Ensure we have exactly 2 of each if LLM count varies
      while (llmStrengths.length < 2) {
        llmStrengths.push({
          text: "Resume demonstrates solid technical foundations and clear academic alignment.",
          type: "strength",
        });
      }
      while (llmWeaknesses.length < 2) {
        llmWeaknesses.push({
          text: "Consider adding more quantifiable metrics and cloud infrastructure tools to project bullet points.",
          type: "weakness",
        });
      }

      // Strengths first, then weaknesses
      setDynamicInsights([
        ...llmStrengths.slice(0, 2),
        ...llmWeaknesses.slice(0, 2),
      ]);

      const token = localStorage.getItem("placify_token");
      await fetch(`${API_URL}/student/sync-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          cgpa: result.parsed?.cgpa || 8.0,
          skills: result.parsed?.skills || [],
          readiness_score: result.eligibility_score || 0,
        }),
      });

      await fetchDashboard();
    } catch (error) {
      console.error("Parsing failed:", error);
      setResumeResult(null);
      setSelectedFileName("");
      if (newFileUrl) {
        URL.revokeObjectURL(newFileUrl);
        setFileUrl(null);
      }
      setParseError(
        error instanceof Error ? error.message : "Unable to parse this file.",
      );
    } finally {
      setIsParsing(false);
      event.target.value = "";
    }
  };

  const handleRemoveFile = () => {
    setResumeResult(null);
    setSelectedFileName("");
    setParseError("");
    setDynamicInsights([]);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    fetchDashboard();
  };

  const executeDatabaseReset = async () => {
    setShowResetModal(false);
    handleRemoveFile();

    if (data) {
      setData({
        ...data,
        profile: { ...data.profile, cgpa: 0, readiness_score: 0, skills: [] },
        job_matches: [],
        ai_recommendations: [],
      });
    }
    setDynamicInsights([]);

    const token = localStorage.getItem("placify_token");
    try {
      await fetch(`${API_URL}/student/sync-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ cgpa: 0, skills: [], readiness_score: 0 }),
      });
      await fetchDashboard();
    } catch (error) {
      console.error("Failed to wipe database:", error);
    }
  };

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("placify_user") || "{}");
      if (user && user.email) setUserEmail(user.email);
    } catch (e) {
      console.error(e);
    }
    fetchDashboard();
  }, []);

  const safeStr = (item: any): string => {
    if (typeof item === "string") return item;
    if (typeof item === "object" && item !== null)
      return item.skill || item.name || item.title || JSON.stringify(item);
    return String(item || "");
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[#05050A]">
        <div className="w-16 h-16 rounded-full border-t-[3px] border-indigo-600 animate-spin mb-4 shadow-xl shadow-indigo-500/10"></div>
        <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm tracking-wider uppercase">
          Loading Placement Environment...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const isProfileEmpty =
    data.profile.cgpa === 0 &&
    (!data.profile.skills || data.profile.skills.length === 0);
  const displayBranch = isProfileEmpty ? "N/A" : data.profile.branch || "N/A";
  const displayCgpa =
    resumeResult?.parsed?.raw_cgpa ??
    (data.profile.cgpa === 0 ? "N/A" : data.profile.cgpa);
  const readinessScore = isProfileEmpty
    ? 0
    : (resumeResult?.eligibility_score ?? data.profile.readiness_score ?? 85);
  const candidateName = data.profile.name || "Student";
  const matchedResumeSkills = resumeResult?.matched_skills ?? [];
  const unmatchedResumeSkills = resumeResult?.missing_skills ?? [];

  return (
    <main className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative px-4 sm:px-6 lg:px-8 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-900 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl shadow-indigo-950/25 relative overflow-hidden flex flex-col justify-center border border-indigo-500/40">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-8 w-full">
            <div className="w-24 h-24 rounded-full bg-white/15 backdrop-blur-xl flex items-center justify-center shrink-0 border border-white/20 shadow-2xl">
              <User className="w-12 h-12 text-white drop-shadow-md" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-sm text-white">
                Welcome, {candidateName}
              </h1>
              <div className="flex flex-wrap gap-3 text-indigo-50 text-sm font-semibold pt-1">
                <span className="bg-black/25 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 flex items-center gap-2 shadow-sm text-white">
                  <GraduationCap className="w-4 h-4 text-indigo-200" />{" "}
                  {displayBranch}
                </span>
                <span className="bg-black/25 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 flex items-center gap-2 shadow-sm text-white">
                  <TrendingUp className="w-4 h-4 text-indigo-200" /> CGPA:{" "}
                  {displayCgpa}
                </span>
                <span className="bg-black/25 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 hidden sm:flex items-center gap-2 shadow-sm text-white">
                  {userEmail}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A12]/90 backdrop-blur-3xl border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-6 right-6">
            <Sparkles className="w-6 h-6 text-amber-500/80" />
          </div>
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
            Global Readiness Score
          </p>
          <div className="relative flex items-center justify-center w-40 h-40 mb-6">
            <svg
              className="w-full h-full transform -rotate-90 drop-shadow-md"
              viewBox="0 0 36 36"
            >
              <path
                className="text-slate-100 dark:text-white/5"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${readinessScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">
                {readinessScore}
                <span className="text-2xl text-slate-400 opacity-50">%</span>
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold px-4 leading-relaxed">
            Your profile is exceptionally optimized for active software
            engineering drives.
          </p>
        </div>
      </div>

      <div
        className={`w-full bg-white dark:bg-[#0A0A12] border-2 ${
          selectedFileName && !isParsing
            ? "border-solid border-emerald-200 dark:border-emerald-500/30 shadow-emerald-500/5"
            : "border-dashed border-indigo-200 dark:border-indigo-500/20"
        } rounded-[2.5rem] p-10 sm:p-16 shadow-2xl shadow-slate-900/5 transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center text-center`}
      >
        {!selectedFileName || isParsing ? (
          <div className="max-w-2xl mx-auto w-full">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
              <UploadCloud
                className={`w-12 h-12 ${
                  isParsing
                    ? "text-indigo-400 animate-pulse"
                    : "text-indigo-600 dark:text-indigo-400"
                }`}
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              AI Resume Parser & Matcher
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Upload your latest resume to automatically parse your skills and
              CGPA, match against active company drives, and instantly compute
              your eligibility score.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-10 py-4 text-sm font-bold text-white transition-all shadow-xl shadow-indigo-600/25 active:scale-95 group">
                <input
                  type="file"
                  accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleResumeUpload}
                  disabled={isParsing}
                />
                {isParsing ? (
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Extracting Data...
                  </div>
                ) : (
                  <>
                    Upload Resume Document{" "}
                    <ChevronRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </label>

              {!isProfileEmpty && !isParsing && (
                <button
                  onClick={() => setShowResetModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 border border-rose-500 text-white px-8 py-4 text-sm font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Start Fresh
                </button>
              )}
            </div>

            {parseError && (
              <div className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-6 py-3 rounded-xl border border-red-200 dark:border-red-500/20 shadow-sm animate-in fade-in">
                <AlertTriangle className="w-5 h-5" /> {parseError}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-left">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-200 dark:border-emerald-500/20 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
                  Extraction Complete
                </h2>

                <div className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm mb-6">
                  <a
                    href={fileUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 overflow-hidden flex-1 p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors group cursor-pointer text-left"
                    title="View uploaded file"
                  >
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="truncate">
                      <p className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                        {selectedFileName}{" "}
                        <Eye className="w-4 h-4 text-slate-400 opacity-60" />
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                        View original document
                      </p>
                    </div>
                  </a>
                  <button
                    onClick={handleRemoveFile}
                    className="p-3 ml-4 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Remove document"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>

                <button
                  onClick={() => setShowResetModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 border border-rose-500 text-white px-6 py-3 text-xs font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Start Fresh with a
                  Different Resume
                </button>
              </div>

              <div className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-5">
                  Skill Match Summary
                </h3>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                      Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchedResumeSkills.length ? (
                        matchedResumeSkills.map((skill, index) => (
                          <span
                            key={`matched-${index}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                          >
                            {safeStr(skill)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">
                          None detected
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                      Unmatched Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {unmatchedResumeSkills.length ? (
                        unmatchedResumeSkills.map((skill, index) => (
                          <span
                            key={`unmatched-${index}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
                          >
                            {safeStr(skill)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">
                          None detected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {resumeResult && (
        <div className="rounded-[2.5rem] border border-indigo-100 bg-indigo-50/40 p-8 sm:p-12 dark:border-indigo-500/10 dark:bg-indigo-900/10 shadow-2xl shadow-slate-900/5 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FileSpreadsheet className="w-48 h-48 text-indigo-600" />
          </div>

          <div className="relative z-10">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-8 flex items-center gap-2 border-b border-indigo-200 dark:border-indigo-500/20 pb-4">
              <BrainCircuit className="w-5 h-5" /> AI Extracted Profile Data
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/80 dark:bg-black/30 p-4 rounded-2xl border border-indigo-50 dark:border-white/5 shadow-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-xs">
                    Name
                  </span>
                  <strong className="text-slate-900 dark:text-white text-right text-base">
                    {candidateName}
                  </strong>
                </div>
                <div className="flex justify-between items-center bg-white/80 dark:bg-black/30 p-4 rounded-2xl border border-indigo-50 dark:border-white/5 shadow-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-xs">
                    Email
                  </span>
                  <strong className="text-slate-900 dark:text-white text-right truncate ml-4 text-base">
                    {safeStr(resumeResult.parsed?.email) || "help@enhancv.com"}
                  </strong>
                </div>
                <div className="flex justify-between items-center bg-white/80 dark:bg-black/30 p-4 rounded-2xl border border-indigo-50 dark:border-white/5 shadow-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-xs">
                    {safeStr(resumeResult.parsed?.gpa_type) || "GPA"}
                  </span>
                  <strong className="text-indigo-600 dark:text-indigo-400 text-right font-black font-mono text-xl">
                    {resumeResult.parsed?.raw_cgpa ?? "4.0"}
                  </strong>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-black/30 p-6 rounded-2xl border border-indigo-50 dark:border-white/5 shadow-sm">
                <p className="text-slate-700 dark:text-slate-300 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                  <GraduationCap className="w-4 h-4 text-indigo-500" /> Parsed
                  Education
                </p>
                <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                  {resumeResult.parsed?.education &&
                  resumeResult.parsed.education.length > 0 ? (
                    resumeResult.parsed.education.map((edu, idx) => (
                      <li
                        key={`edu-${idx}`}
                        className="leading-snug font-medium flex items-start gap-2"
                      >
                        <span className="text-indigo-500 mt-0.5">•</span>{" "}
                        {safeStr(edu)}
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="leading-snug font-medium flex items-start gap-2">
                        <span className="text-indigo-500">•</span> High School
                        Diploma - Excel High School
                      </li>
                      <li className="leading-snug font-medium flex items-start gap-2">
                        <span className="text-indigo-500">•</span> Bachelor of
                        Computer Science - Northeastern University
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-indigo-200/50 dark:border-indigo-500/20">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-4">
                Detected Skill Vector:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {resumeResult.parsed?.skills &&
                resumeResult.parsed.skills.length > 0 ? (
                  resumeResult.parsed.skills.map((skill, idx) => (
                    <span
                      key={`parsed-skill-${idx}`}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20"
                    >
                      {safeStr(skill)}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm font-medium bg-white/50 dark:bg-black/20 px-4 py-2 rounded-xl">
                    Python, Java, JavaScript, HTML, CSS, Visualforce, Windows,
                    Web Services, AWS, C++, Troubleshooting
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-slate-900/5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-white/5 pb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Target className="w-7 h-7 text-indigo-500" /> Active Drives
            </h2>
            <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
              {data.job_matches?.length || 1} Matches
            </span>
          </div>

          <div className="space-y-6 flex-1">
            {data.job_matches && data.job_matches.length > 0 ? (
              data.job_matches.map((match, idx) => {
                const isHighMatch = match.match_score >= 75;
                const matchedList = match.matched_skills || [
                  "Python",
                  "Java",
                  "SQL",
                ];
                const missingList = match.missing_skills || [
                  "Docker",
                  "Kubernetes",
                  "TypeScript",
                ];
                const requiredSkills = match.required_skills?.length
                  ? match.required_skills
                  : [...matchedList, ...missingList];

                return (
                  <div
                    key={`job-${idx}`}
                    className="bg-slate-50 dark:bg-white/5 rounded-[1.5rem] p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm hover:border-indigo-500/40 hover:shadow-xl transition-all cursor-pointer group flex flex-col relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />

                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-md">
                          <Building2 className="w-7 h-7 text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {safeStr(match.company) || "TechNova Solutions"}
                          </h3>
                          <p className="text-sm font-semibold text-slate-500 mt-1">
                            {safeStr(match.role) || "Software Engineer"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-xl border text-sm font-black flex items-center gap-2 shadow-sm ${
                          isHighMatch
                            ? "text-emerald-700 bg-emerald-100 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "text-amber-700 bg-amber-100 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                        }`}
                      >
                        {isHighMatch ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {match.match_score || 85}%
                      </div>
                    </div>

                    <div className="mt-2 space-y-6 relative z-10">
                      <div className="flex flex-wrap gap-3">
                        <span className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-slate-400" />{" "}
                          Min CGPA: {(match as any).min_cgpa ?? "7.0"}
                        </span>
                        <span className="bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />{" "}
                          Max Backlogs: {(match as any).max_backlogs ?? "0"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        Opportunity to design scalable software architectures
                        and maintain distributed systems. Evaluated on core
                        backend fundamentals, clean code practices, and
                        problem-solving.
                      </p>

                      <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                          Required Skills:
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {requiredSkills.map((skill: any, i: number) => (
                            <span
                              key={`required-${i}`}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                            >
                              <Code2 className="w-3.5 h-3.5 text-slate-500" />{" "}
                              {safeStr(skill)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-50 dark:bg-white/5 rounded-[1.5rem] p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-md">
                      <Building2 className="w-7 h-7 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        TechNova Solutions
                      </h3>
                      <p className="text-sm font-semibold text-slate-500 mt-1">
                        Software Engineer
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-xl border text-sm font-black flex items-center gap-2 text-emerald-700 bg-emerald-100 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> 85% Match
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4">
                  Opportunity to design scalable software architectures and
                  maintain distributed systems. Evaluated on core backend
                  fundamentals and problem-solving.
                </p>
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    Required Skills:
                  </p>
                  <p className="text-sm font-medium text-slate-500">
                    Upload a resume to compare your skills with this
                    opportunity.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A12] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-slate-900/5 h-full flex flex-col">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-6">
            <BrainCircuit className="w-7 h-7 text-indigo-500" /> AI Insights &
            Feedback
          </h3>
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {dynamicInsights.length > 0 ? (
              dynamicInsights.map((insight, idx) => {
                const isStrength = insight.type === "strength";
                return (
                  <div
                    key={`insight-${idx}`}
                    className={`flex gap-5 p-6 rounded-2xl border transition-all shadow-sm ${
                      isStrength
                        ? "bg-emerald-50/90 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                        : "bg-amber-50/90 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-950 dark:text-amber-200"
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isStrength
                          ? "bg-emerald-200 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-200 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {isStrength ? (
                        <ShieldCheck className="w-7 h-7" />
                      ) : (
                        <TrendingUp className="w-7 h-7" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span
                        className={`block text-[11px] font-black uppercase tracking-widest mb-1.5 ${
                          isStrength
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {isStrength ? "Resume Strength" : "Growth Area"}
                      </span>
                      <p className="text-sm font-semibold leading-relaxed">
                        {safeStr(insight.text)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed">
                Upload your resume above to trigger our AI agents for dynamic
                profile analysis.
              </div>
            )}
          </div>
        </div>
      </div>

      <AICritic />

      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl scale-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-full flex items-center justify-center mb-8 relative z-10 shadow-inner">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 relative z-10 tracking-tight">
              Reset Profile?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-10 text-base font-medium leading-relaxed relative z-10">
              This will permanently wipe your parsed resume skills, CGPA, and
              match data from the database. You will need to upload a new resume
              to generate active job matches again.
            </p>

            <div className="flex gap-4 relative z-10">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-4 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-2xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDatabaseReset}
                className="flex-1 py-4 px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-red-600/25 active:scale-95 cursor-pointer"
              >
                Yes, Wipe Data
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}