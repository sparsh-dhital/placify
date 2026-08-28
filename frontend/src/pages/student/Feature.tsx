import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileText,
  MapPin,
  Sparkles,
  Target,
  UploadCloud,
  Eye,
  Trash2,
  BrainCircuit,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getStudentDashboard,
  parseStudentResume,
  API_URL,
} from "../../services/api";
import type {
  ResumeMatchResult,
  StudentDashboardResponse,
} from "../../services/api";

type FeatureType = "resume" | "opportunities" | "interviews" | "readiness";

const featureConfig: Record<
  FeatureType,
  { title: string; description: string; icon: typeof FileText }
> = {
  resume: {
    title: "Resume & Eligibility",
    description:
      "Manage your placement document, view AI extraction results, and check job eligibility.",
    icon: FileText,
  },
  opportunities: {
    title: "Job Opportunities",
    description:
      "Review companies, roles, match scores, and the skills that can improve your chances.",
    icon: Briefcase,
  },
  interviews: {
    title: "My Interviews",
    description:
      "See your confirmed interview schedule, room, panel, and round details.",
    icon: Calendar,
  },
  readiness: {
    title: "Skill Readiness",
    description:
      "Track your placement readiness and the next actions recommended by Placify AI.",
    icon: BarChart3,
  },
};

export default function StudentFeature({ type }: { type: FeatureType }) {
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [resumeResult, setResumeResult] = useState<ResumeMatchResult | null>(
    null,
  );
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [userEmail, setUserEmail] = useState<string>("Not uploaded");
  const [showResetModal, setShowResetModal] = useState(false);
  const [dynamicRecs, setDynamicRecs] = useState<string[]>([]);

  const config = featureConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const fetchDashboard = async () => {
    try {
      const result = await getStudentDashboard();
      setData(result);
      if (result && !resumeResult) setDynamicRecs(result.ai_recommendations);
    } catch (error) {
      console.error(error);
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
      const result = await parseStudentResume(file, {
        company: "TechNova Solutions",
        role: "Software Engineer",
        matched_skills: ["Python", "SQL", "Git", "React"],
        missing_skills: ["Docker"],
      });
      setResumeResult(result);

      // Inject strong & weak points into recommendations
      const newRecs: string[] = [];
      if (result.parsed.strong_points) {
        result.parsed.strong_points.forEach((pt: string) =>
          newRecs.push(`Strength: ${pt}`),
        );
      }
      if (result.parsed.weak_points) {
        result.parsed.weak_points.forEach((pt: string) =>
          newRecs.push(`Improvement: ${pt}`),
        );
      }
      if (newRecs.length > 0) {
        setDynamicRecs(newRecs);
      }

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

      await fetchDashboard();
    } catch (error) {
      console.error("Resume parsing failed:", error);
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

  const handleRemoveFile = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setResumeResult(null);
    setSelectedFileName("");
    setParseError("");
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    if (data) setDynamicRecs(data.ai_recommendations);
  };

  const executeDatabaseReset = async () => {
    setShowResetModal(false);
    handleRemoveFile();

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
      console.error("Failed to reset profile:", error);
    }
  };

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3"></div>
        Loading your feature data...
      </div>
    );
  }

  const displayBranch =
    data.profile.branch === "CSE" && data.profile.cgpa === 0
      ? "Branch Not Set"
      : data.profile.branch;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <Link
            to="/student"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-500 hover:text-indigo-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Icon className="w-7 h-7 text-indigo-500" />
            {config.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            {config.description}
          </p>
        </div>
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          {data.profile.name} · {displayBranch}
        </div>
      </header>

      {type === "resume" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-8 shadow-sm">
            <div
              className={`w-full bg-slate-50 dark:bg-white/5 border-2 ${selectedFileName && !isParsing ? "border-solid border-emerald-200 dark:border-emerald-500/30" : "border-dashed border-indigo-200 dark:border-indigo-500/30"} rounded-2xl p-8 text-center transition-colors mb-8`}
            >
              {!selectedFileName || isParsing ? (
                <>
                  <UploadCloud
                    className={`w-10 h-10 mx-auto mb-4 ${isParsing ? "text-indigo-400 animate-pulse" : "text-indigo-500"}`}
                  />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Upload Document
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                    Supported formats: PDF, TXT, JPG, PNG, WEBP.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white transition active:scale-95">
                      <input
                        type="file"
                        accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={handleResumeUpload}
                        disabled={isParsing}
                      />
                      {isParsing ? "Scanning..." : "Choose File"}
                    </label>

                    {data.profile.cgpa > 0 && !isParsing && (
                      <button
                        onClick={() => setShowResetModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#0A0A12] border-2 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-5 py-2.5 text-sm font-bold transition shadow-sm active:scale-95"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Fresh Start
                      </button>
                    )}
                  </div>

                  {parseError && (
                    <p className="mt-4 text-xs font-bold text-red-500">
                      {parseError}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Document Analyzed
                  </h2>

                  <div className="max-w-md mx-auto flex items-center justify-between p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm hover:border-indigo-300 transition-all">
                    <a
                      href={fileUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 overflow-hidden group flex-1 hover:bg-slate-100 dark:hover:bg-white/10 p-2 rounded-lg transition cursor-pointer"
                      title="Click to view document"
                    >
                      <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left truncate">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                          {selectedFileName}{" "}
                          <Eye className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Ready for review
                        </p>
                      </div>
                    </a>

                    <div className="flex items-center shrink-0 ml-2 border-l border-slate-200 dark:border-white/10 pl-2">
                      <button
                        onClick={handleRemoveFile}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {resumeResult && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Detailed Match Analysis
                  </h3>
                  <span
                    className={`rounded-xl border px-3 py-1 text-sm font-bold ${resumeResult.eligibility_status === "Eligible" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}
                  >
                    {resumeResult.eligibility_score}% Score
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Verified Skills
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white font-medium leading-relaxed">
                      {resumeResult.matched_skills.join(" • ") ||
                        "No exact matches"}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-red-500 mb-2">
                      Missing Skills
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium leading-relaxed">
                      {resumeResult.missing_skills.join(" • ") ||
                        "No gaps detected"}
                    </p>
                  </div>
                </div>

                <details className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12] overflow-hidden group">
                  <summary className="cursor-pointer p-4 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors list-none flex justify-between items-center">
                    View Raw Extracted Text
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="p-4 border-t border-slate-200 dark:border-white/10">
                    <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-mono">
                      {resumeResult.parsed.extracted_text ||
                        "No text was detected in the document."}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {resumeResult
                  ? "Newly Extracted Data"
                  : "Saved Candidate Profile"}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {resumeResult?.parsed.name || data.profile.name}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Contact
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {resumeResult?.parsed.email &&
                  resumeResult.parsed.email !== "N/A"
                    ? resumeResult.parsed.email
                    : userEmail}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {resumeResult?.parsed.gpa_type || "CGPA"}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {resumeResult?.parsed.raw_cgpa ?? data.profile.cgpa}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Phone
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {resumeResult?.parsed.phone || "Not Found"}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Detected Technologies
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                  {resumeResult?.parsed.skills.join(" • ") ||
                    (data.profile.cgpa > 0
                      ? "Data saved. Upload a new document to overwrite skills."
                      : "Upload a document to extract skills")}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ... (opportunities and interview blocks) */}
      {type === "opportunities" && (
        <div className="grid gap-6 md:grid-cols-2">
          {data.job_matches.map((match) => (
            <section
              key={match.company}
              className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-8 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {match.company}
                  </h2>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                    {match.role}
                  </p>
                </div>
                <span
                  className={`rounded-xl px-4 py-1.5 text-sm font-bold border ${match.match_score >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"}`}
                >
                  {match.match_score}% Match
                </span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Matched Skills
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {match.matched_skills.join(" • ") || "None"}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-red-500 mb-2">
                    Skill Gaps
                  </p>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300 leading-relaxed">
                    {match.missing_skills.join(" • ") || "No critical gaps"}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {type === "interviews" && (
        <section className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-8 shadow-sm">
          {data.upcoming_interview ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Company", data.upcoming_interview.company, Briefcase],
                [
                  "Date & Time",
                  `${data.upcoming_interview.date}, ${data.upcoming_interview.time}`,
                  Calendar,
                ],
                ["Location", data.upcoming_interview.room, MapPin],
                ["Panel", data.upcoming_interview.panel, Target],
              ].map(([label, value, ItemIcon]) => {
                const DetailIcon = ItemIcon as typeof Calendar;
                return (
                  <div
                    key={label as string}
                    className="rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-6"
                  >
                    <div className="w-10 h-10 bg-white dark:bg-[#0A0A12] rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <DetailIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-900/60 dark:text-indigo-200/60 mb-1">
                      {label as string}
                    </p>
                    <p className="font-bold text-indigo-950 dark:text-white text-lg">
                      {value as string}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No interviews scheduled yet. Check back later.</p>
            </div>
          )}
        </section>
      )}

      {type === "readiness" && (
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-8 shadow-sm flex flex-col justify-center items-center text-center">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Overall Readiness
            </p>
            <p className="text-7xl font-black text-slate-900 dark:text-white mb-6">
              {data.profile.readiness_score}
              <span className="text-4xl text-slate-400">%</span>
            </p>
            <div className="w-full h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${data.profile.readiness_score}%` }}
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <BrainCircuit className="w-6 h-6 text-indigo-500" /> AI Insights &
              Actions
            </h2>
            <div className="space-y-4">
              {dynamicRecs.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors"
                >
                  <Sparkles className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Tailwind Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl scale-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-5">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Reset Profile Data?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
              This will permanently wipe your saved resume data, CGPA, and
              skills from the Placify database. You will need to upload a new
              resume to generate job matches.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDatabaseReset}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20"
              >
                Yes, Wipe Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
