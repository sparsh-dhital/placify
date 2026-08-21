// src/pages/student/Dashboard.tsx
import { useState, useEffect } from "react";
import {
  User,
  Target,
  Calendar,
  MapPin,
  UsersRound,
  CheckCircle2,
  XCircle,
  Sparkles,
  UploadCloud,
  FileText,
  Sliders,
  ArrowRight,
  Wand2,
  ShieldCheck,
} from "lucide-react";
import { getStudentDashboard, uploadResume } from "../../services/api";
import type { StudentDashboardResponse } from "../../services/api";
import { getSession } from "../../utils/session";
import { useCallback } from "react";

export default function StudentDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Backend Agent Workflow States (from app.py & resume_parser.py)
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentOutput, setAgentOutput] = useState<any | null>(null);

  // What-if simulator state
  const [simCgpa, setSimCgpa] = useState<number>(8.7);
  const [simSkills, setSimSkills] = useState("");
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const fetchDashboard = useCallback(async () => {
    const activeStudentId = getSession()?.userId || "s1";
    setError(null);
    try {
      const result = await getStudentDashboard(activeStudentId);
      setData(result);
      setSimCgpa(result.profile.cgpa);
    } catch (requestError) {
      console.error(requestError);
      setError(
        "Unable to load your dashboard. Start the FastAPI server and verify your student record.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRunAgentWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) return;
    setUploadError(null);
    setIsAnalyzing(true);
    uploadResume(getSession()?.userId || "s1", resumeFile)
      .then((uploaded) => {
        const target = data?.job_matches[0];
        const targetSkills = [
          ...(target?.required_skills || []),
          ...(target?.preferred_skills || []),
        ];
        const fallbackSkills = [
          ...(target?.matched_skills || []),
          ...(target?.missing_skills || []),
        ];
        const requirements = targetSkills.length
          ? targetSkills
          : fallbackSkills;
        const parsedSkills = new Set(
          (uploaded.profile.skills || []).map((skill) => skill.toLowerCase()),
        );
        const requirementResults = requirements.map((requirement) => ({
          requirement,
          met: parsedSkills.has(requirement.toLowerCase()),
        }));
        const cgpaMet =
          !target?.min_cgpa || uploaded.profile.cgpa >= target.min_cgpa;
        const backlogsMet =
          (uploaded.profile.backlogs ?? 0) <= (target?.max_backlogs ?? 0);
        setAgentOutput({
          is_eligible:
            cgpaMet &&
            backlogsMet &&
            requirementResults.every((item) => item.met),
          reason: `Parsed ${uploaded.profile.skills?.length || 0} skills, CGPA ${uploaded.profile.cgpa}, and ${uploaded.profile.backlogs || 0} backlog(s) from ${resumeFile.name}.`,
          readiness_score: {
            total: Math.min(100, 60 + uploaded.skills_saved * 5),
            out_of: 100,
            breakdown: {
              technical_skills: uploaded.skills_saved * 5,
              projects: (uploaded.profile.projects || []).length * 4,
              cgpa_weight: 20,
            },
          },
          requirement_results: [
            ...requirementResults,
            ...(target?.min_cgpa
              ? [
                  {
                    requirement: `Minimum CGPA ${target.min_cgpa}`,
                    met: cgpaMet,
                  },
                ]
              : []),
            ...(target
              ? [
                  {
                    requirement: `Maximum backlogs ${target.max_backlogs ?? 0}`,
                    met: backlogsMet,
                  },
                ]
              : []),
          ],
          resume_profile: uploaded.profile,
          resume_text: uploaded.resume_text,
        });
      })
      .catch((error) => {
        console.error(error);
        setUploadError(
          error instanceof Error ? error.message : "Resume upload failed",
        );
      })
      .finally(() => {
        setIsAnalyzing(false);
      });
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const hasDocker = simSkills.toLowerCase().includes("docker");
    setSimulationResult({
      is_eligible: simCgpa >= 7.5,
      missing_skills: hasDocker ? [] : ["Docker"],
    });
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

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-16 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/20 dark:bg-red-500/10">
        <h1 className="text-lg font-bold text-red-800 dark:text-red-300">
          Dashboard unavailable
        </h1>
        <p className="mt-2 text-sm text-red-700 dark:text-red-200">{error}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchDashboard();
          }}
          className="mt-5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const missingRequirements =
    agentOutput?.requirement_results.filter((r: any) => !r.met) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
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
              Welcome, {data.profile.name} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">
              {data.profile.branch} • Roll No: {data.profile.roll_no} • CGPA:{" "}
              {data.profile.cgpa}
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
          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000"
              style={{
                width: `${data.profile.readiness_score}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interviews, Job Matches & Fastest Path to Eligibility */}
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

          {/* 🎯 Fastest Path to Eligibility (Directly mirrored from app.py) */}
          {missingRequirements.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />{" "}
                Fastest Path to Eligibility
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-200/80 mb-4">
                Add evidence for these requirements to unlock missing
                eligibility criteria:
              </p>
              <div className="space-y-2">
                {missingRequirements.map((req: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-white/80 dark:bg-[#05050A]/60 rounded-xl border border-amber-200 dark:border-amber-500/20 text-sm text-slate-900 dark:text-white flex items-start gap-2"
                  >
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      •
                    </span>
                    <div>
                      <span className="font-bold">{req.requirement}:</span>{" "}
                      build a small project, complete a certification, or add
                      verified experience using this skill.
                    </div>
                  </div>
                ))}
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
              {!agentOutput ? (
                <div className="p-8 text-center">
                  <Target className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Upload your resume to see job matches
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Matching analysis will appear after the resume evaluator
                    finishes.
                  </p>
                </div>
              ) : data.job_matches.length === 0 ? (
                <div className="p-8 text-center">
                  <Target className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No live opportunities yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Approved roles will appear here as soon as the matching
                    agent runs.
                  </p>
                </div>
              ) : (
                data.job_matches.map((match, idx) => {
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
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Resume Upload & OCR Agent Pipeline (from app.py) */}
        <div className="space-y-6">
          {/* Resume Upload & Evaluation Card */}
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-500" /> Resume & Agent
              Evaluator
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Upload your latest CV to run deterministic rule verification and
              OCR extraction[cite: 3].
            </p>

            <form onSubmit={handleRunAgentWorkflow} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-white/5 relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    e.target.files && setResumeFile(e.target.files[0])
                  }
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-6 h-6 text-indigo-500 mb-1" />
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {resumeFile ? resumeFile.name : "Upload Resume (PDF/Img)"}
                </p>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !resumeFile}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-none"
              >
                {isAnalyzing ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                {isAnalyzing ? "Running Agent Workflow..." : "Evaluate Resume"}
              </button>
            </form>

            {uploadError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {uploadError}
              </p>
            )}

            {agentOutput && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 space-y-4 animate-in fade-in">
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    agentOutput.is_eligible
                      ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-50 dark:bg-red-500/10 border-red-200 text-red-700 dark:text-red-400"
                  }`}
                >
                  {agentOutput.is_eligible ? (
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{agentOutput.reason}</span>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Requirement Checklist
                  </p>
                  <div className="space-y-1.5">
                    {agentOutput.requirement_results.map(
                      (req: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-[#05050A] text-xs"
                        >
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {req.requirement}
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded ${req.met ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}
                          >
                            {req.met ? "MET" : "MISSING"}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* What-if Eligibility Simulator Card (Directly from app.py) */}
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" /> What-if Simulator
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Test score or skill upgrades instantly[cite: 3].
            </p>

            <form onSubmit={handleSimulate} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Simulated CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simCgpa}
                  onChange={(e) => setSimCgpa(parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Added Skills (comma-sep)
                </label>
                <input
                  type="text"
                  placeholder="Docker, AWS"
                  value={simSkills}
                  onChange={(e) => setSimSkills(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-opacity hover:opacity-90 cursor-none flex items-center justify-center gap-1.5"
              >
                Run Simulation <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {simulationResult && (
              <div
                className={`mt-4 p-3 rounded-xl text-xs font-semibold ${
                  simulationResult.is_eligible
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200"
                }`}
              >
                {simulationResult.is_eligible
                  ? "✅ What-if result: Eligible!"
                  : `⚠️ Missing skills: ${simulationResult.missing_skills.join(", ") || "none"}`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
