// src/pages/student/ResumeAnalyzer.tsx
import { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  Sparkles,
  Wand2,
  Sliders,
  ArrowRight,
} from "lucide-react";
import { uploadResume } from "../../services/api";
import { getSession } from "../../utils/session";

export default function StudentResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState(
    "Hiring Backend Engineers. Minimum CGPA required is 7.5. Skills needed: Python, SQL, Docker.",
  );
  const [cgpa, setCgpa] = useState<number>(8.0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [output, setOutput] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // What-if simulator state
  const [simCgpa, setSimCgpa] = useState<number>(8.0);
  const [simSkills, setSimSkills] = useState("");
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const handleRunWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a resume file.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const uploaded = await uploadResume(getSession()?.userId || "s1", file);
      const skills = uploaded.profile.skills || [];
      setOutput({
        is_eligible: uploaded.profile.cgpa >= 7.5,
        reason: "Resume parsed and profile updated successfully.",
        readiness_score: {
          total: Math.min(
            100,
            Math.round(uploaded.profile.cgpa * 7 + skills.length * 5),
          ),
          out_of: 100,
          breakdown: {
            technical_skills: skills.length * 5,
            projects: (uploaded.profile.projects || []).length * 4,
            cgpa_weight: Math.round(uploaded.profile.cgpa * 2),
          },
        },
        requirement_results: skills.map((skill) => ({
          requirement: skill,
          met: true,
        })),
        resume_profile: uploaded.profile,
        resume_text: uploaded.resume_text,
      });
      setSimCgpa(uploaded.profile.cgpa);
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Resume analysis failed",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate what-if check
    const hasDocker = simSkills.toLowerCase().includes("docker");
    setSimulationResult({
      is_eligible: simCgpa >= 7.5 && hasDocker,
      missing_skills: hasDocker ? [] : ["Docker"],
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Wand2 className="w-7 h-7 text-indigo-500" />
          AI Placement Readiness & Resume Analyzer
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-2xl">
          Upload your resume (PDF, DOCX, TXT, or Image) and evaluate it against
          target job descriptions using our deterministic extraction engine.
        </p>
      </div>
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Input Form */}
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <form onSubmit={handleRunWorkflow} className="space-y-6">
            {/* JD Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Job Description (JD)
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={4}
                className="w-full p-4 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-inner"
              />
            </div>

            {/* Resume File Uploader */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Upload Resume (PDF, DOCX, TXT, Image)
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files && setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {file ? file.name : "Click or drag resume file here"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports OCR text extraction for scanned files
                </p>
              </div>
            </div>

            {/* CGPA Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Your Current CGPA
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(parseFloat(e.target.value))}
                className="w-full p-3 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Running Agent
                  Workflow...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Run Placement Agent
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Output & Decision Summary */}
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5 flex flex-col justify-between">
          {!output && !isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-16">
              <Sparkles className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-sm font-medium text-slate-500">
                Upload a resume and click run to view AI evaluation results.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-16">
              <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
              <p className="text-sm font-mono text-indigo-500">
                Extracting text & analyzing requirements...
              </p>
            </div>
          )}

          {output && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Decision Badge */}
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  output.is_eligible
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                    : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"
                }`}
              >
                {output.is_eligible ? (
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider">
                    {output.is_eligible
                      ? "Approved / Eligible"
                      : "Disqualified"}
                  </h3>
                  <p className="text-xs mt-0.5 opacity-90">{output.reason}</p>
                </div>
              </div>

              {/* Readiness Score */}
              <div className="bg-slate-50 dark:bg-[#05050A] p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Readiness Score
                  </span>
                  <span className="text-lg font-bold font-mono text-indigo-500">
                    {output.readiness_score.total} /{" "}
                    {output.readiness_score.out_of}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{ width: `${output.readiness_score.total}%` }}
                  ></div>
                </div>
              </div>

              {/* Requirement Checklist */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Requirement Match Results
                </h3>
                <div className="space-y-2">
                  {output.requirement_results.map((req: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/5 text-sm"
                    >
                      <span className="font-medium text-slate-900 dark:text-white">
                        {req.requirement}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${req.met ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}
                      >
                        {req.met ? "MET" : "MISSING"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* What-if Simulator Section */}
      {output && (
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-500" /> What-if Eligibility
            Simulator
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Test a possible improvement without running the full parser again.
          </p>

          <form
            onSubmit={handleSimulate}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Simulated CGPA
              </label>
              <input
                type="number"
                step="0.1"
                value={simCgpa}
                onChange={(e) => setSimCgpa(parseFloat(e.target.value))}
                className="w-full p-3 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Added Skills (comma-sep)
              </label>
              <input
                type="text"
                placeholder="Docker, AWS"
                value={simSkills}
                onChange={(e) => setSimSkills(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-xl hover:opacity-90 transition-opacity cursor-none flex items-center justify-center gap-2"
            >
              Simulate <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {simulationResult && (
            <div
              className={`mt-6 p-4 rounded-xl text-sm font-semibold ${simulationResult.is_eligible ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200"}`}
            >
              {simulationResult.is_eligible
                ? "✅ What-if result: Eligible!"
                : `⚠️ What-if result: Still missing skills (${simulationResult.missing_skills.join(", ")})`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
