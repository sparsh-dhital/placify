// src/pages/admin/JDAnalyzer.tsx
import { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { analyzeJD, JDAnalysisResponse } from "../../services/api"; // Updated import path

export default function JDAnalyzer() {
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JDAnalysisResponse | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim()) return;

    setIsAnalyzing(true);
    try {
      // Toggle 'true' to 'false' when the backend is fully merged and running locally
      const data = await analyzeJD(jdText, true);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload / Input */}
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <form onSubmit={handleAnalyze} className="flex flex-col h-full">
            {/* Drag & Drop Area */}
            <div className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-none mb-6">
              <UploadCloud className="w-10 h-10 text-indigo-500 mb-4" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Drag & Drop JD PDF
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                or click to browse files
              </p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                OR
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
            </div>

            {/* Text Paste Area */}
            <div className="flex-1 flex flex-col min-h-[200px] relative">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste Job Description text here..."
                className="flex-1 w-full p-4 bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none cursor-none shadow-inner"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !jdText.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-2xl hover:scale-[1.01] active:scale-95 transition-all cursor-none shadow-lg shadow-indigo-600/25"
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
          </form>
        </div>

        {/* Right Column: AI Extracted Results */}
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-900/5 relative overflow-hidden flex flex-col">
          {!result && !isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <Sparkles className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-sm font-medium text-slate-500">
                Awaiting job description input...
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
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
            <div className="flex-1 flex flex-col animate-in fade-in duration-500">
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

              {/* Eligibility Section */}
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
                  <div className="flex flex-col bg-slate-50 dark:bg-[#05050A] p-3 rounded-xl border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 text-xs mb-1">
                      Salary Package
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {result.salary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="flex-1 mb-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200 dark:border-white/10">
                  Extracted Skills
                </h3>
                <div className="space-y-2 text-sm">
                  {result.required_skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {skill}
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
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
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        {skill}
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-amber-600 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                        Preferred
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto pt-4 border-t border-slate-200 dark:border-white/10">
                <button className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-all cursor-none">
                  Edit Extracted Data
                </button>
                <button className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all cursor-none shadow-lg shadow-emerald-600/20">
                  Approve Requirements
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}