// frontend/src/pages/admin/JDAnalyzer.tsx
import { useState, useRef, useEffect } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  Wand2,
  Eye,
  Trash2,
  AlertCircle,
  BrainCircuit,
} from "lucide-react";
import { analyzeJD, analyzeJDFile, publishActiveJob } from "../../services/api";
import type { JDAnalysisResponse } from "../../services/api";

export default function JDAnalyzer() {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [jdText, setJdText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<JDAnalysisResponse | null>(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setResult(null);

    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(URL.createObjectURL(selectedFile));

    event.target.value = ""; // Reset input
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setError("");
      setResult(null);

      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFileUrl(URL.createObjectURL(droppedFile));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setJdText("");
    setError("");
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  };

  const handleAnalyze = async () => {
    if (activeTab === "upload" && !file) {
      setError("Please upload a JD document first.");
      return;
    }
    if (activeTab === "paste" && !jdText.trim()) {
      setError("Please paste a valid job description.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      let analysis: JDAnalysisResponse;

      if (activeTab === "upload" && file) {
        analysis = await analyzeJDFile(file);
        // Auto-generate text representation for publishing
        const formattedText = `Company: ${analysis.company}\nRole: ${analysis.role}\nSalary Package: ${analysis.salary}\n\nEligibility Criteria:\n- Minimum CGPA: ${analysis.min_cgpa}\n- Maximum Active Backlogs: ${analysis.max_backlogs}\n\nRequired Skills:\n${analysis.required_skills.map((s) => `- ${s}`).join("\n")}\n\nPreferred Skills:\n${analysis.preferred_skills.map((s) => `- ${s}`).join("\n")}`;
        setJdText(formattedText);
      } else {
        analysis = await analyzeJD(jdText);
      }

      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to analyze the job description.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishActiveJob({ text: jdText });
      alert(
        "Success! Job description approved and published live to student portals.",
      );
    } catch (err: any) {
      alert("Failed to publish job: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BrainCircuit
            className="w-7 h-7 text-indigo-500"
            aria-hidden="true"
          />
          JD Extraction Engine
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-xl">
          Upload a company's JD to automatically extract hard requirements,
          skills, and eligibility criteria before publishing to student portals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Input Panel */}
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Data Source
            </h2>
            <div className="flex p-1 bg-slate-100 dark:bg-[#05050A] rounded-xl border border-slate-200 dark:border-white/5">
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-none ${
                  activeTab === "upload"
                    ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setActiveTab("paste")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-none ${
                  activeTab === "paste"
                    ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            {activeTab === "upload" ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`flex-1 min-h-[250px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all cursor-pointer group ${
                  file
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5"
                    : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.md,.csv,image/*"
                  className="hidden"
                  disabled={isAnalyzing}
                />
                {file ? (
                  <div className="text-center w-full">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1 truncate px-4">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={fileUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#05050A] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Drag & Drop JD Document
                    </p>
                    <p className="text-xs text-slate-500">
                      Supports PDF, TXT, MD, CSV, and Images
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative pointer-events-auto">
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste Job Description text here..."
                  rows={10}
                  data-lenis-prevent="true"
                  className="w-full h-[250px] p-4 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none overflow-y-scroll overscroll-contain shadow-inner [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600"
                />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={
                isAnalyzing ||
                (activeTab === "upload" && !file) ||
                (activeTab === "paste" && !jdText.trim())
              }
              className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all cursor-none shadow-lg shadow-indigo-600/25 disabled:opacity-75 disabled:hover:scale-100 active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin" /> Analyzing
                  Requirements...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Extract Constraints
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel: AI Extracted Results */}
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
                <BrainCircuit className="w-6 h-6 text-indigo-400 animate-pulse" />
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
                  disabled={isPublishing}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  {isPublishing ? "Publishing..." : "Approve & Publish Live"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
