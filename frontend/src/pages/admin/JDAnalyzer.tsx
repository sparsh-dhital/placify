// frontend/src/pages/admin/JDAnalyzer.tsx
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  Wand2,
  Eye,
  Trash2,
} from "lucide-react";
import { analyzeJD, analyzeJDFile, publishActiveJob } from "../../services/api";
import type { JDAnalysisResponse } from "../../services/api";

export default function JDAnalyzer() {
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JDAnalysisResponse | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim()) return;
    setIsAnalyzing(true);
    setError("");
    try {
      const data = await analyzeJD(jdText);
      setResult(data);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to analyze the job description.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setError("");
    setIsAnalyzing(true);

    if (fileUrl) URL.revokeObjectURL(fileUrl);
    const newFileUrl = URL.createObjectURL(file);
    setFileUrl(newFileUrl);

    try {
      const analysis = await analyzeJDFile(file);
      setResult(analysis);

      const formattedText = `Company: ${analysis.company}
Role: ${analysis.role}
Salary Package: ${analysis.salary}

Eligibility Criteria:
- Minimum CGPA: ${analysis.min_cgpa}
- Maximum Active Backlogs: ${analysis.max_backlogs}

Required Skills:
${analysis.required_skills.map((s) => `- ${s}`).join("\n")}

Preferred Skills:
${analysis.preferred_skills.map((s) => `- ${s}`).join("\n")}
`;
      setJdText(formattedText);
    } catch (fileError) {
      console.error(fileError);
      setError(
        fileError instanceof Error
          ? fileError.message
          : "Unable to read this file.",
      );
      setResult(null);
      setSelectedFileName("");
      if (newFileUrl) {
        URL.revokeObjectURL(newFileUrl);
        setFileUrl(null);
      }
    } finally {
      setIsAnalyzing(false);
      event.target.value = "";
    }
  };

  const handleRemoveFile = () => {
    setSelectedFileName("");
    setResult(null);
    setJdText("");
    setError("");
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  };

  const handlePublish = async () => {
    try {
      await publishActiveJob({ text: jdText });
      alert(
        "Success! Job description approved and published live to student portals.",
      );
    } catch (err: any) {
      alert("Failed to publish job: " + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Wand2 className="w-7 h-7 text-indigo-500" />
          AI Job Description Analyzer
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
          Upload a company's JD to automatically extract hard requirements,
          skills, and eligibility criteria.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column */}
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <form onSubmit={handleAnalyze} className="flex flex-col">
            {!selectedFileName || isAnalyzing ? (
              <label className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer mb-6">
                <UploadCloud
                  className={`w-10 h-10 mb-4 ${isAnalyzing ? "text-indigo-400 animate-pulse" : "text-indigo-500"}`}
                />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {isAnalyzing
                    ? "Analyzing Document..."
                    : "Drag & Drop JD Document"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports PDF, TXT, MD, CSV, and Images
                </p>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.csv,application/pdf,text/plain,image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isAnalyzing}
                />
              </label>
            ) : (
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-emerald-200 dark:border-emerald-500/30 text-center space-y-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Document Successfully Analyzed
                </p>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm">
                  <a
                    href={fileUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 overflow-hidden flex-1 p-1 hover:opacity-80 transition-opacity text-left cursor-pointer"
                    title="Tap to view uploaded file"
                  >
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                        {selectedFileName}{" "}
                        <Eye className="w-3 h-3 text-slate-400" />
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Tap to view document
                      </p>
                    </div>
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer ml-2 border-l border-slate-200 dark:border-white/10 pl-2"
                    title="Remove Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                OR PASTE TEXT
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
            </div>

            {/* Scrollable Textarea with pointer-events-auto */}
            <div className="relative mb-6 pointer-events-auto">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste Job Description text here..."
                rows={8}
                data-lenis-prevent="true"
                className="w-full h-52 p-4 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none overflow-y-scroll overscroll-contain pointer-events-auto shadow-inner [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !jdText.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-2xl transition-all cursor-pointer shadow-lg shadow-indigo-600/25"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Analyzing
                  Requirements...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Analyze JD
                </>
              )}
            </button>
            {error && (
              <p
                className="mt-3 text-sm font-medium text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Right Column: AI Extracted Results */}
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5 relative overflow-hidden flex flex-col min-h-0">
          {!result && !isAnalyzing && (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center opacity-50">
              <Sparkles className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-sm font-medium text-slate-500">
                Awaiting job description input...
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                <Wand2 className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <p className="text-sm font-mono text-indigo-500 dark:text-indigo-400">
                agent_extractor running...
              </p>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="flex flex-col animate-in fade-in duration-500">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {result.company}
                  </h2>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {result.role}
                  </p>
                </div>
                {result.ai_confidence && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      AI Confidence
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
                      {result.ai_confidence}%
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200 dark:border-white/10">
                  Eligibility Criteria
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col bg-slate-50 dark:bg-[#05050A] p-3 rounded-xl border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 text-xs mb-1">
                      Min CGPA
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ≥ {result.min_cgpa}
                    </span>
                  </div>
                  <div className="flex flex-col bg-slate-50 dark:bg-[#05050A] p-3 rounded-xl border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 text-xs mb-1">
                      Max Backlogs
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {result.max_backlogs}
                    </span>
                  </div>
                  <div className="flex flex-col bg-slate-50 dark:bg-[#05050A] p-3 rounded-xl border border-slate-200 dark:border-white/5 col-span-2">
                    <span className="text-slate-500 text-xs mb-1">
                      Salary Package
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {result.salary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Skills Section with pointer-events-auto */}
              <div className="mb-6 pointer-events-auto">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200 dark:border-white/10">
                  Extracted Skills
                </h3>
                <div
                  data-lenis-prevent="true"
                  className="space-y-2 text-sm overflow-y-scroll max-h-48 min-h-0 pr-1 overscroll-contain pointer-events-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600"
                >
                  {result.required_skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{skill}</span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                        Mandatory
                      </span>
                    </div>
                  ))}
                  {result.preferred_skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{skill}</span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-amber-600 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20 shrink-0">
                        Preferred
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Discard
                </button>
                <button
                  onClick={handlePublish}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  Approve & Publish Live
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
