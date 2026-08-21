// src/pages/student/Dashboard.tsx
import { useState, useEffect } from "react";
import {
  User,
  Calendar,
  MapPin,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Sparkles,
  UploadCloud,
  Sliders,
  ArrowRight,
  ShieldCheck,
  FileSearch,
  FileCheck2,
  BookOpen,
} from "lucide-react";
import type {
  StudentDashboardResponse,
  ResumeMatchResult,
} from "../../services/api";
import { getStudentDashboard, parseStudentResume } from "../../services/api";

export default function StudentDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<StudentDashboardResponse | null>(null);

  // Resume Upload & Real Parser State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentOutput, setAgentOutput] = useState<ResumeMatchResult | null>(
    null,
  );

  // What-if simulator state
  const [simCgpa, setSimCgpa] = useState<number>(0);
  const [simSkills, setSimSkills] = useState("");
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  // Agent Roadmap state (Wow Feature)
  const [activeRoadmapSkill, setActiveRoadmapSkill] = useState<string | null>(
    null,
  );

  const activeStudentId = "s1";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getStudentDashboard(activeStudentId, true);
        setData(result);
        setSimCgpa(result.profile.cgpa);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleRunAgentWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) return;

    setIsAnalyzing(true);

    try {
      const result = await parseStudentResume(resumeFile);
      setAgentOutput(result);
      if (result.missing_skills.length > 0) {
        setActiveRoadmapSkill(result.missing_skills[0]);
      }
    } catch (error) {
      console.error("Failed to parse resume:", error);
      alert("Error parsing document. Please try a different file.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const hasDocker = simSkills.toLowerCase().includes("docker");
    setSimulationResult({
      is_eligible: simCgpa >= 7.5,
      missing_skills: hasDocker ? [] : ["Docker"],
    });
  };

  const resetAnalysis = () => {
    setResumeFile(null);
    setAgentOutput(null);
    setSimulationResult(null);
    setActiveRoadmapSkill(null);
  };

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
      className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 relative overflow-hidden"
      aria-label="Student Placement Dashboard"
    >
      {/* Soft Ambient Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 blur-[140px] pointer-events-none rounded-full hidden dark:block" />

      {/* Profile Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/85 dark:bg-[#0A0A12]/85 backdrop-blur-3xl border border-slate-100 dark:border-white/[0.08] rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/40 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <User className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hello, {data.profile.name} ✨
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
              {data.profile.branch} Department • Roll No:{" "}
              <span className="font-mono">{data.profile.roll_no}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 md:border-l md:border-slate-200 dark:md:border-white/10 md:pl-8">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Readiness Score
            </p>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400 font-mono">
              {agentOutput?.eligibility_score || data.profile.readiness_score}%
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="space-y-8 relative z-10">
        {/* Core Ingestion Zone (Clean Single Card with Smooth Shadow) */}
        {!agentOutput ? (
          <section
            aria-labelledby="upload-heading"
            className="bg-white/85 dark:bg-[#0A0A12]/85 backdrop-blur-3xl border border-slate-100 dark:border-white/[0.08] rounded-[2.5rem] p-8 sm:p-14 shadow-xl shadow-slate-900/5 dark:shadow-black/40 relative overflow-hidden text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 mb-6 border border-indigo-500/20 shadow-inner">
              <FileSearch className="w-8 h-8" aria-hidden="true" />
            </div>
            <h2
              id="upload-heading"
              className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight"
            >
              Upload Resume for AI Diagnostics
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
              Drop your CV here. Our local OCR engine supports{" "}
              <strong className="text-slate-900 dark:text-white">
                PDF, TXT, JPG, and PNG
              </strong>
              . The AI will instantly verify eligibility and extract skill
              vectors.
            </p>

            <form
              onSubmit={handleRunAgentWorkflow}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div className="relative group border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] p-10 hover:bg-indigo-500/[0.02] dark:hover:bg-white/[0.02] hover:border-indigo-500/40 transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => {
                    if (e.target.files) setResumeFile(e.target.files[0]);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  required
                />
                <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {resumeFile
                      ? resumeFile.name
                      : "Click to browse or drag and drop your resume"}
                  </span>
                  <span className="text-xs text-slate-400">
                    PDF, TXT or High-Res Image (Max 25MB)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !resumeFile}
                className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-base font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all cursor-none"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" /> Analyzing
                    Document Text...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5" /> Generate AI Diagnostic
                    Report
                  </>
                )}
              </button>
            </form>
          </section>
        ) : (
          /* Diagnostic Report & Wow Feature (Agent Roadmap) */
          <div className="space-y-8">
            <section
              aria-labelledby="report-heading"
              className="bg-white/85 dark:bg-[#0A0A12]/85 backdrop-blur-3xl border border-slate-100 dark:border-white/[0.08] rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-slate-900/5 dark:shadow-black/40"
            >
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-white/[0.06] pb-6">
                <div>
                  <h2
                    id="report-heading"
                    className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
                  >
                    <FileCheck2 className="w-6 h-6 text-emerald-500" />{" "}
                    Diagnostic Report
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Evaluated for{" "}
                    <strong className="text-slate-900 dark:text-white">
                      {agentOutput.company}
                    </strong>{" "}
                    — {agentOutput.role}
                  </p>
                </div>
                <button
                  onClick={resetAnalysis}
                  className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-none"
                >
                  Upload New Resume
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Detected Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {agentOutput.parsed.skills.map((s) => (
                      <span
                        key={s}
                        className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Missing Target Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {agentOutput.missing_skills.length > 0 ? (
                      agentOutput.missing_skills.map((s) => (
                        <span
                          key={s}
                          onClick={() => setActiveRoadmapSkill(s)}
                          className="px-3.5 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-red-500/20 transition-colors shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" /> {s} (View Roadmap)
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-500 font-semibold">
                        Zero critical skills missing!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {activeRoadmapSkill && (
                <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-indigo-500/[0.03] dark:bg-indigo-500/[0.08] border border-indigo-500/20 backdrop-blur-xl">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> AI 3-Day Micro-Roadmap for{" "}
                    {activeRoadmapSkill}
                  </h4>
                  <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mb-4">
                    Autogenerated by Placify Skill-Gap Agent to clear drive
                    bottlenecks.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700 dark:text-slate-300">
                    <li className="p-4 bg-white/80 dark:bg-[#05050A]/80 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                      <strong className="text-indigo-500 block mb-1">
                        Day 1: Fundamentals
                      </strong>{" "}
                      Core concepts, syntax & fundamental architecture.
                    </li>
                    <li className="p-4 bg-white/80 dark:bg-[#05050A]/80 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                      <strong className="text-indigo-500 block mb-1">
                        Day 2: Execution
                      </strong>{" "}
                      Build 1 targeted mini-project or API integration.
                    </li>
                    <li className="p-4 bg-white/80 dark:bg-[#05050A]/80 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                      <strong className="text-indigo-500 block mb-1">
                        Day 3: Mastery
                      </strong>{" "}
                      Solve top 5 interview coding patterns.
                    </li>
                  </ul>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Bottom Row: Simulator & Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white/85 dark:bg-[#0A0A12]/85 backdrop-blur-3xl border border-slate-100 dark:border-white/[0.08] rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/40 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" /> What-if
                Simulator
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Test how upgrading your CGPA or adding skills affects drive
                eligibility.
              </p>

              <form onSubmit={handleSimulate} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Target CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={simCgpa}
                    onChange={(e) => setSimCgpa(parseFloat(e.target.value))}
                    className="w-full p-4 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Virtual Skills
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Docker"
                    value={simSkills}
                    onChange={(e) => setSimSkills(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-none"
                >
                  Run Simulation <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {simulationResult && (
              <div
                className={`mt-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm ${
                  simulationResult.is_eligible
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {simulationResult.is_eligible ? (
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0" />
                )}
                <span>
                  {simulationResult.is_eligible
                    ? "Status: Eligible for premium drives."
                    : `Disqualified. Missing skills: ${simulationResult.missing_skills.join(", ") || "none"}`}
                </span>
              </div>
            )}
          </section>

          {data.upcoming_interview && (
            <section className="bg-white/85 dark:bg-[#0A0A12]/85 backdrop-blur-3xl border border-slate-100 dark:border-white/[0.08] rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/40 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" /> Active
                  Schedule
                </h3>

                <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6 shadow-sm">
                  <p className="font-bold text-indigo-900 dark:text-indigo-200 text-lg">
                    {data.upcoming_interview.company}
                  </p>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                    {data.upcoming_interview.role}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Location
                    </span>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <MapPin className="w-4 h-4 text-indigo-500" />{" "}
                      {data.upcoming_interview.room}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Time
                    </span>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white font-mono">
                      <Calendar className="w-4 h-4 text-indigo-500" />{" "}
                      {data.upcoming_interview.time}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">
                  Panel: {data.upcoming_interview.panel}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                  Confirmed
                </span>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}