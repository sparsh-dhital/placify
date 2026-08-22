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
import { cn } from "../../utils/cn";
import { AICritic } from "../../components/ui/AICritic"; // <-- AI Critic Imported

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

  // Agent Roadmap state
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

  if (isLoading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Loading your placement profile...
        </p>
      </div>
    );
  }

  const currentScore =
    agentOutput?.eligibility_score || data.profile.readiness_score;

  return (
    <main
      className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 relative z-10"
      aria-label="Student Placement Dashboard"
    >
      {/* Soft Ambient Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-r from-indigo-500/10 via-cyan-500/5 to-transparent blur-[140px] pointer-events-none rounded-full hidden dark:block -z-10" />

      {/* Profile Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/85 dark:bg-[#0A0A12]/85 backdrop-blur-3xl border border-slate-100 dark:border-white/[0.08] rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/40 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
            <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hello, {data.profile.name.split(" ")[0]} ✨
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
              {data.profile.branch} Dept • Roll:{" "}
              <span className="font-mono bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
                {data.profile.roll_no}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-6 py-4 rounded-2xl flex items-center gap-6 shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Readiness Score
            </p>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 font-mono">
              {currentScore}%
            </p>
          </div>
          {/* Minimal SVG Ring */}
          <div className="relative w-12 h-12">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 36 36"
            >
              <path
                className="text-slate-100 dark:text-white/5"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${currentScore}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* LEFT COLUMN (Wider): Core AI Ingestion & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {!agentOutput ? (
            <section className="bg-white/85 dark:bg-[#0A0A12]/85 backdrop-blur-3xl border border-slate-100 dark:border-white/[0.08] rounded-[2.5rem] p-8 sm:p-14 shadow-xl shadow-slate-900/5 dark:shadow-black/40 relative overflow-hidden text-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-6 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                <FileSearch className="w-8 h-8" aria-hidden="true" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                AI Resume Diagnostics
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
                <div className="relative group border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] p-10 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all cursor-pointer">
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
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span className="text-base font-bold text-slate-900 dark:text-white text-center px-4">
                      {resumeFile
                        ? resumeFile.name
                        : "Click to browse or drag and drop your resume"}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      PDF, TXT, or Image (Max 25MB)
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzing || !resumeFile}
                  className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-base font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" /> Analyzing
                      Document Text...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-5 h-5" /> Generate AI
                      Diagnostic Report
                    </>
                  )}
                </button>
              </form>
            </section>
          ) : (
            /* Diagnostic Report View */
            <section className="bg-white/85 dark:bg-[#0A0A12]/85 backdrop-blur-3xl border border-slate-100 dark:border-white/[0.08] rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-slate-900/5 dark:shadow-black/40 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex justify-between items-start mb-8 border-b border-slate-100 dark:border-white/5 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-1">
                    <FileCheck2 className="w-6 h-6 text-emerald-500" />{" "}
                    Diagnostic Report
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Evaluated for{" "}
                    <strong className="text-slate-900 dark:text-white">
                      {agentOutput.company}
                    </strong>{" "}
                    — {agentOutput.role}
                  </p>
                </div>
                <button
                  onClick={resetAnalysis}
                  className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Upload New
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
                        className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
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
                          className="px-3.5 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shadow-sm"
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

              {/* AI Micro-Roadmap */}
              {activeRoadmapSkill && (
                <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-indigo-50 dark:bg-indigo-500/[0.08] border border-indigo-100 dark:border-indigo-500/20 backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> AI 3-Day Micro-Roadmap for{" "}
                    {activeRoadmapSkill}
                  </h4>
                  <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mb-4">
                    Autogenerated by Placify Skill-Gap Agent.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700 dark:text-slate-300">
                    <li className="p-4 bg-white dark:bg-[#05050A]/80 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                      <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">
                        Day 1: Fundamentals
                      </strong>
                      Core concepts, syntax & fundamental architecture.
                    </li>
                    <li className="p-4 bg-white dark:bg-[#05050A]/80 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                      <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">
                        Day 2: Execution
                      </strong>
                      Build 1 targeted mini-project or API integration.
                    </li>
                    <li className="p-4 bg-white dark:bg-[#05050A]/80 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                      <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">
                        Day 3: Mastery
                      </strong>
                      Solve top 5 interview coding patterns.
                    </li>
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Simulator & Schedule */}
        <div className="space-y-6 flex flex-col">
          {/* What-If Simulator */}
          <section className="bg-white/85 dark:bg-[#0A0A12]/85 backdrop-blur-3xl border border-slate-100 dark:border-white/[0.08] rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/40 flex-1 flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
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
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Run Simulation <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {simulationResult && (
              <div
                className={cn(
                  "mt-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm border",
                  simulationResult.is_eligible
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                    : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20",
                )}
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

          {/* Active Schedule */}
          {data.upcoming_interview && (
            <section className="bg-indigo-600 dark:bg-[#1E1B4B] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-lg font-bold text-indigo-100 mb-6 flex items-center gap-2 tracking-wide">
                <Calendar className="w-5 h-5 text-indigo-300" /> Active Schedule
              </h3>

              <div className="p-5 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/10 mb-6 relative z-10 backdrop-blur-sm">
                <p className="font-bold text-white text-lg">
                  {data.upcoming_interview.company}
                </p>
                <p className="text-sm font-semibold text-indigo-200 mt-1">
                  {data.upcoming_interview.role}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="p-4 rounded-2xl bg-black/10 dark:bg-black/30 border border-white/5 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block mb-1">
                    Location
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <MapPin className="w-4 h-4 text-indigo-300" />
                    {data.upcoming_interview.room}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-black/10 dark:bg-black/30 border border-white/5 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block mb-1">
                    Time
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                    <Calendar className="w-4 h-4 text-indigo-300" />
                    {data.upcoming_interview.time}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                <span className="text-xs text-indigo-200 font-semibold">
                  Panel: {data.upcoming_interview.panel}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Confirmed
                </span>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Floating Groq-powered AI Critic */}
      <AICritic />
    </main>
  );
}