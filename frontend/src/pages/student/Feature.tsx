// src/pages/student/Feature.tsx
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
  Upload,
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
      "Keep your profile current and understand your eligibility for placement drives.",
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
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const config = featureConfig[type];
  const Icon = config.icon;
  const displayedName = resumeResult?.parsed.name || data?.profile.name;

  useEffect(() => {
    getStudentDashboard().then(setData).catch(console.error);
  }, []);

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setParseError("");
    setResumeResult(null);
    setIsParsing(true);
    try {
      const result = await parseStudentResume(file, {
        company: "TechNova Solutions",
        role: "Software Engineer",
        matched_skills: ["Python", "SQL", "Git", "React"],
        missing_skills: ["Docker"],
      });
      setResumeResult(result);

      // Permanently sync parsed resume data to MongoDB backend
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
      console.error("Resume parsing or syncing failed:", error);
      setParseError(
        error instanceof Error
          ? error.message
          : "Unable to parse this file. Try a clearer PDF or image.",
      );
    } finally {
      setIsParsing(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-text-secondary">
        Loading your student data...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            to="/student"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-500 hover:text-indigo-400 mb-4"
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
          {displayedName} ·{" "}
          {resumeResult?.parsed.education[0] || data.profile.branch}
        </div>
      </header>

      {type === "resume" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Upload your latest resume
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Supported formats: PDF, TXT, JPG, JPEG, PNG, and WEBP.
            </p>
            <label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5 text-center transition hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
              <Upload className="w-8 h-8 text-indigo-500 mb-3" />
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                {isParsing ? "Parsing resume..." : "Choose resume file"}
              </span>
              <span className="mt-1 text-xs text-text-secondary">
                AI will extract skills and eligibility details
              </span>
              <input
                type="file"
                accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,image/*,text/plain,application/pdf"
                className="hidden"
                onChange={handleResumeUpload}
                disabled={isParsing}
              />
            </label>
            {selectedFileName && (
              <p className="mt-3 text-xs text-text-secondary">
                Selected: {selectedFileName}
              </p>
            )}
            {parseError && (
              <p
                className="mt-3 text-sm font-medium text-red-600 dark:text-red-400"
                role="alert"
              >
                {parseError}
              </p>
            )}
            {resumeResult && (
              <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#05050A] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Parsed candidate
                    </p>
                    <p className="mt-1 text-lg font-bold text-text-primary">
                      {resumeResult.parsed.name}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {resumeResult.parsed.email} · {resumeResult.parsed.phone}{" "}
                      · CGPA {resumeResult.parsed.cgpa ?? "N/A"}
                    </p>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {resumeResult.eligibility_score}%
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Detected skills
                  </p>
                  <p className="mt-2 text-sm text-text-primary">
                    {resumeResult.parsed.skills.join(" · ") ||
                      "No skills detected"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Education
                  </p>
                  <p className="mt-2 text-sm text-text-primary">
                    {resumeResult.parsed.education.join(" · ") ||
                      "No education details detected"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Match result
                  </p>
                  <p className="mt-2 text-sm text-text-primary">
                    {resumeResult.matched_skills.join(" · ") ||
                      "No direct matches"}
                  </p>
                  <p className="mt-1 text-sm text-amber-600 dark:text-amber-300">
                    Missing:{" "}
                    {resumeResult.missing_skills.join(" · ") ||
                      "No critical gaps"}
                  </p>
                </div>
                <details className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12] p-3">
                  <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-text-secondary">
                    View extracted text
                  </summary>
                  <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-text-primary">
                    {resumeResult.parsed.extracted_text ||
                      "No text was detected."}
                  </pre>
                </details>
              </div>
            )}
          </section>
          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Current profile
            </h2>
            <div className="mt-5 space-y-3 text-sm text-text-secondary">
              <p>
                <strong className="text-text-primary">Name:</strong>{" "}
                {displayedName}
              </p>
              <p>
                <strong className="text-text-primary">Email:</strong>{" "}
                {resumeResult?.parsed.email || "Upload resume to extract"}
              </p>
              <p>
                <strong className="text-text-primary">Phone:</strong>{" "}
                {resumeResult?.parsed.phone || "Upload resume to extract"}
              </p>
              <p>
                <strong className="text-text-primary">CGPA:</strong>{" "}
                {resumeResult?.parsed.cgpa ?? data.profile.cgpa}
              </p>
              <p>
                <strong className="text-text-primary">Education:</strong>{" "}
                {resumeResult?.parsed.education.join(" · ") ||
                  "Upload resume to extract"}
              </p>
            </div>
            <div className="mt-6 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Eligibility score
              </p>
              <p className="mt-1 text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                {resumeResult?.eligibility_score ??
                  data.profile.readiness_score}
                %
              </p>
            </div>
          </section>
        </div>
      )}

      {type === "opportunities" && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.job_matches.map((match) => (
            <section
              key={match.company}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {match.company}
                  </h2>
                  <p className="text-sm text-text-secondary">{match.role}</p>
                </div>
                <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {match.match_score}% match
                </span>
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Matched skills
                </p>
                <p className="mt-2 text-sm text-text-primary">
                  {match.matched_skills.join(" · ")}
                </p>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Skill gaps
                </p>
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-300">
                  {match.missing_skills.join(" · ") || "No critical gaps"}
                </p>
              </div>
            </section>
          ))}
        </div>
      )}

      {type === "interviews" && (
        <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-6 shadow-sm">
          {data.upcoming_interview ? (
            <div className="grid gap-5 sm:grid-cols-4">
              {[
                ["Company", data.upcoming_interview.company, Briefcase],
                [
                  "Date & time",
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
                    className="rounded-xl bg-slate-50 dark:bg-white/5 p-4"
                  >
                    <DetailIcon className="w-5 h-5 text-indigo-500 mb-3" />
                    <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      {label as string}
                    </p>
                    <p className="mt-1 font-semibold text-text-primary">
                      {value as string}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-secondary">No interviews scheduled yet.</p>
          )}
        </section>
      )}

      {type === "readiness" && (
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-6 shadow-sm">
            <p className="text-sm font-semibold text-text-secondary">
              Placement readiness
            </p>
            <p className="mt-3 text-6xl font-black text-indigo-500">
              {data.profile.readiness_score}%
            </p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${data.profile.readiness_score}%` }}
              />
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A12]/80 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary">
              Recommended next actions
            </h2>
            <div className="mt-4 space-y-3">
              {data.ai_recommendations.map((recommendation) => (
                <div
                  key={recommendation}
                  className="flex gap-3 rounded-xl bg-slate-50 dark:bg-white/5 p-4 text-sm text-text-primary"
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                  {recommendation}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {type === "resume" && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Your eligibility profile is ready to analyze.
        </div>
      )}
    </div>
  );
}