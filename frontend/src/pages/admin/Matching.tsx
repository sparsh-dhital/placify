// src/pages/admin/Matching.tsx
import { useState } from "react";
import {
  BrainCircuit,
  Play,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Target,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  generateMatches,
  MatchResponse,
  MatchResult,
} from "../../services/api";

export default function Matching() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<MatchResponse | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);

  // Hardcoded job ID for demonstration
  const activeJobId = "20000000-0000-0000-0000-000000000001";

  const handleGenerate = async () => {
    setIsProcessing(true);
    setData(null);
    setSelectedMatch(null);
    try {
      // Toggle 'true' to 'false' when testing with the live FastAPI backend
      const result = await generateMatches(activeJobId, true);
      setData(result);
      if (result.matches.length > 0) {
        setSelectedMatch(result.matches[0]); // Auto-select first candidate
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85)
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60)
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Agent Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit
              className="w-7 h-7 text-indigo-500"
              aria-hidden="true"
            />
            Matchmaker Agent
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-xl">
            Compare eligible students against job skills. Mandatory skills carry
            higher weight to generate explainable readiness scores.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all cursor-none shadow-lg shadow-indigo-600/25 shrink-0"
        >
          {isProcessing ? (
            <BrainCircuit
              className="w-4 h-4 animate-bounce"
              aria-hidden="true"
            />
          ) : (
            <Play className="w-4 h-4" aria-hidden="true" />
          )}
          {isProcessing ? "Agent Analyzing..." : "Generate AI Matches"}
        </button>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-12 shadow-xl shadow-slate-900/5 flex flex-col items-center justify-center text-center">
          <div className="relative w-20 h-20 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
            <BrainCircuit
              className="w-8 h-8 text-indigo-400 animate-pulse"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Calculating Skill Vectors
          </h3>
          <p className="text-sm text-slate-500 font-mono">
            Mapping student proficiencies against TechNova requirements...
          </p>
        </div>
      )}

      {/* Results View */}
      {data && !isProcessing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {/* Candidates List (Left Column) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {data.company}
                </h2>
                <p className="text-sm text-slate-500">
                  {data.job} • {data.candidates_analyzed} Candidates Analyzed
                </p>
              </div>
              <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                AI MATCH RESULTS
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {data.matches.map((match) => (
                <div
                  key={match.student_id}
                  onClick={() => setSelectedMatch(match)}
                  className={`group p-4 rounded-2xl border transition-all cursor-none flex items-center justify-between ${
                    selectedMatch?.student_id === match.student_id
                      ? "bg-slate-50 dark:bg-white/5 border-indigo-500/50 shadow-md"
                      : "bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:border-indigo-500/30"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {match.student_name}
                      {match.match_score >= 90 && (
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      {match.matched_skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {match.matched_skills.length > 3 && (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-1 py-0.5">
                          +{match.matched_skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-sm font-bold font-mono ${getScoreColor(match.match_score)}`}
                    >
                      {match.match_score}%
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-colors ${selectedMatch?.student_id === match.student_id ? "text-indigo-500" : "text-slate-300 dark:text-slate-600 group-hover:text-slate-400"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainability Panel (Right Column) */}
          <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 p-6 h-fit sticky top-24">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" aria-hidden="true" />
              Match Explanation
            </h3>

            {selectedMatch ? (
              <div className="space-y-6 animate-in fade-in">
                {/* Score & Confidence Header */}
                <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-white/10">
                  <div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedMatch.student_name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                      AI Confidence:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {selectedMatch.confidence}
                      </span>
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-xl border text-xl font-bold font-mono ${getScoreColor(selectedMatch.match_score)}`}
                  >
                    {selectedMatch.match_score}%
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 p-4 rounded-xl">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Why this match?
                  </p>
                  <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                    "{selectedMatch.explanation}"
                  </p>
                </div>

                {/* Skills Breakdown */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                      Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMatch.matched_skills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#05050A] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{" "}
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedMatch.missing_skills.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
                        Missing Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMatch.missing_skills.map((skill) => (
                          <div
                            key={skill}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs font-medium text-red-700 dark:text-red-400"
                          >
                            <XCircle className="w-3.5 h-3.5" /> {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center opacity-50">
                <BrainCircuit
                  className="w-10 h-10 text-slate-400 mb-3"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-slate-500">
                  Select a candidate to view AI reasoning and skill gaps.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}