// frontend/src/pages/student/Feature.tsx
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
  UploadCloud,
  Eye,
  Trash2,
  BrainCircuit,
  RotateCcw,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Code2,
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
  const [showResetModal, setShowResetModal] = useState(false);

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
    } catch (error) {
      console.error("Feature dashboard fetch error:", error);
    }
  };

  useEffect(() => {
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
      const primaryJob =
        data?.job_matches && data.job_matches.length > 0
          ? data.job_matches[0]
          : null;
      const targetJobPayload = {
        company: primaryJob?.company || "",
        role: primaryJob?.role || "",
        matched_skills: primaryJob?.required_skills || [],
        missing_skills: [],
      };

      const result = await parseStudentResume(file, targetJobPayload as any);
      setResumeResult(result);

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
    fetchDashboard();
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

  const safeStr = (item: any): string => {
    if (typeof item === "string") return item;
    if (typeof item === "object" && item !== null)
      return item.skill || item.name || item.title || JSON.stringify(item);
    return String(item || "");
  };

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3"></div>
        Loading feature data from MongoDB...
      </div>
    );
  }

  const displayBranch =
    data.profile.branch === "CSE" && data.profile.cgpa === 0
      ? "Branch Not Set"
      : data.profile.branch;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 relative">
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
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm">
          {data.profile.name} · {displayBranch}
        </div>
      </header>

      {type === "resume" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/85 p-8 shadow-xl">
            <div
              className={`w-full bg-slate-50 dark:bg-white/5 border-2 ${
                selectedFileName && !isParsing
                  ? "border-solid border-emerald-200 dark:border-emerald-500/30"
                  : "border-dashed border-indigo-200 dark:border-indigo-500/30"
              } rounded-3xl p-8 text-center transition-all mb-8`}
            >
              {!selectedFileName || isParsing ? (
                <>
                  <UploadCloud
                    className={`w-12 h-12 mx-auto mb-4 ${
                      isParsing
                        ? "text-indigo-400 animate-pulse"
                        : "text-indigo-500"
                    }`}
                  />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Upload Placement Document
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                    Supported formats: PDF, TXT, Images.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                      <input
                        type="file"
                        accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={handleResumeUpload}
                        disabled={isParsing}
                      />
                      {isParsing ? "Scanning OCR..." : "Choose File"}
                    </label>

                    {data.profile.cgpa > 0 && !isParsing && (
                      <button
                        onClick={() => setShowResetModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white px-6 py-3.5 text-sm font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" /> Start Fresh
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
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Document Successfully Analyzed
                  </h2>

                  <div className="max-w-md mx-auto flex items-center justify-between p-3 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
                    <a
                      href={fileUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 overflow-hidden group flex-1 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                    >
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                          {selectedFileName}{" "}
                          <Eye className="w-4 h-4 text-slate-400" />
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Verified record
                        </p>
                      </div>
                    </a>
                    <button
                      onClick={handleRemoveFile}
                      className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {resumeResult && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Extraction Analysis
                  </h3>
                  <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                    {resumeResult.eligibility_score}% Match Score
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Matched Skills
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white font-medium leading-relaxed">
                      {resumeResult.matched_skills.join(", ") ||
                        "None detected"}
                    </p>
                  </div>
                  <div className="p-5 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-red-500 mb-2">
                      Missing Skills
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium leading-relaxed">
                      {resumeResult.missing_skills.join(", ") || "None"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/85 p-8 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-500" />
              Eligibility Verification
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <span className="text-sm text-slate-500">CGPA Status</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {data.profile.cgpa} / 10.0
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <span className="text-sm text-slate-500">Active Backlogs</span>
                <span className="font-mono font-bold text-emerald-500">
                  0 (Cleared)
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <span className="text-sm text-slate-500">Shortlist Status</span>
                <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase">
                  Verified Active
                </span>
              </div>
            </div>
          </section>
        </div>
      )}

      {type === "opportunities" && (
        <div className="space-y-6">
          <div
            className={`grid gap-6 ${
              (data.job_matches?.length ?? 0) > 1
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {data.job_matches && data.job_matches.length > 0 ? (
              data.job_matches.map((job, idx) => (
                <div
                  key={idx}
                  className="rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/85 p-8 shadow-xl space-y-6 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {safeStr(job.company)}
                        </h3>
                        <p className="text-sm font-semibold text-slate-500 mt-0.5">
                          {safeStr(job.role)}
                        </p>
                      </div>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black font-mono">
                      {job.match_score}% Match
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {job.description ||
                      "Enterprise-scale software engineering opportunity requiring strong algorithmic and system design proficiencies."}
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                      Required Skills Vector:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills?.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5"
                        >
                          <Code2 className="w-3.5 h-3.5 text-indigo-500" />{" "}
                          {safeStr(skill)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/85 p-12 text-center text-slate-500 shadow-xl">
                No active company job matches currently available.
              </div>
            )}
          </div>
        </div>
      )}

      {type === "interviews" && (
        <div className="rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/85 p-8 sm:p-12 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Scheduled Interviews
          </h3>
          {data.upcoming_interview ? (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
                  Confirmed Slot
                </span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  {data.upcoming_interview.company}
                </h4>
                <p className="text-sm text-slate-500">
                  {data.upcoming_interview.round || "Technical Round"} • Panel:{" "}
                  {data.upcoming_interview.panel}
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-mono font-bold">
                  <Calendar className="w-4 h-4 text-indigo-500" />{" "}
                  {data.upcoming_interview.time}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-indigo-500" />{" "}
                  {data.upcoming_interview.room}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-medium">
              No interview slots currently committed for your profile. Check
              back after shortlisting is completed.
            </div>
          )}
        </div>
      )}

      {type === "readiness" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/85 p-8 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Readiness Index
              </p>
              <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {data.profile.readiness_score}%
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-6 leading-relaxed">
              Calculated dynamically using CGPA weight and skill vector overlap.
            </p>
          </div>

          <div className="md:col-span-2 rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/85 p-8 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> AI Action Plan
            </h3>
            <ul className="space-y-3">
              {data.ai_recommendations?.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300 font-medium"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{safeStr(rec)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

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
              match data from the database.
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
    </div>
  );
}
