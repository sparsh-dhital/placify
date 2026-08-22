import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Bot,
  Users,
  Play,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { runEligibility } from "../../services/api";
import type {
  EligibilityResponse,
  EligibilityResult,
} from "../../services/api";

export default function Eligibility() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<EligibilityResponse | null>(null);
  const [selectedStudent, setSelectedStudent] =
    useState<EligibilityResult | null>(null);

  // Hardcoded job ID for demonstration; in production, this would come from route params
  const activeJobId = "20000000-0000-0000-0000-000000000001";

  const handleRunAgent = async () => {
    setIsProcessing(true);
    setData(null);
    setSelectedStudent(null);
    try {
      // Toggle 'true' to 'false' when testing with the live FastAPI backend
      const result = await runEligibility(activeJobId, true);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Agent Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-indigo-500" aria-hidden="true" />
            Eligibility Agent
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-xl">
            Evaluate registered students against strict JD constraints (CGPA,
            Backlogs) to generate the baseline eligible pool.
          </p>
        </div>

        <button
          onClick={handleRunAgent}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all cursor-none shadow-lg shadow-indigo-600/25 shrink-0"
          aria-label={
            isProcessing ? "Running Eligibility Agent" : "Run Eligibility Check"
          }
        >
          {isProcessing ? (
            <Bot className="w-4 h-4 animate-bounce" aria-hidden="true" />
          ) : (
            <Play className="w-4 h-4" aria-hidden="true" />
          )}
          {isProcessing ? "Agent Running..." : "Run Eligibility Check"}
        </button>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-12 shadow-xl shadow-slate-900/5 flex flex-col items-center justify-center text-center">
          <div className="relative w-20 h-20 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-cyan-400 animate-spin reverse"></div>
            <Bot
              className="w-8 h-8 text-indigo-400 animate-pulse"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Analyzing Student Registers
          </h3>
          <p className="text-sm text-slate-500 font-mono">
            Verifying CGPA and Backlog constraints for TechNova Solutions...
          </p>
        </div>
      )}

      {/* Results View */}
      {data && !isProcessing && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Total Analyzed
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.total_students}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-500" aria-hidden="true" />
              </div>
            </div>
            <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-500/20 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  Eligible
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.eligible_students}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2
                  className="w-5 h-5 text-emerald-500"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-xl border border-red-200/50 dark:border-red-500/20 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                  Ineligible
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.ineligible_students}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Data Table */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-white/10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {data.company}
                </h2>
                <p className="text-sm text-slate-500">{data.job}</p>
              </div>
              <div className="overflow-x-auto">
                <table
                  className="w-full text-left text-sm"
                  role="grid"
                  aria-label="Student Eligibility Results"
                >
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Student</th>
                      <th className="px-6 py-4 font-semibold">CGPA</th>
                      <th className="px-6 py-4 font-semibold">Backlogs</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {data.results.map((student) => (
                      <tr
                        key={student.student_id}
                        onClick={() => setSelectedStudent(student)}
                        className={`group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-none ${selectedStudent?.student_id === student.student_id ? "bg-indigo-50/50 dark:bg-indigo-500/10" : ""}`}
                        role="row"
                        tabIndex={0}
                        aria-selected={
                          selectedStudent?.student_id === student.student_id
                        }
                      >
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          {student.student_name}
                          <ChevronRight
                            className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-hidden="true"
                          />
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {student.cgpa}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {student.backlogs}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                              student.eligible
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                                : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                            }`}
                          >
                            {student.eligible ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Explanation Panel */}
            <div className="bg-white dark:bg-[#0A0A12]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl shadow-slate-900/5 p-6 h-fit sticky top-24">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle
                  className="w-4 h-4 text-indigo-500"
                  aria-hidden="true"
                />
                Explanation Log
              </h3>

              {selectedStudent ? (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedStudent.student_name}
                    </p>
                    <p
                      className={`text-sm font-semibold mt-1 ${selectedStudent.eligible ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {selectedStudent.eligible
                        ? "✓ Meets all constraints"
                        : "✗ Failed constraints"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-sm">
                      <span className="text-slate-500">CGPA Log</span>
                      <span className="font-medium text-slate-900 dark:text-white font-mono">
                        {selectedStudent.cgpa}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-sm">
                      <span className="text-slate-500">Backlogs Log</span>
                      <span className="font-medium text-slate-900 dark:text-white font-mono">
                        {selectedStudent.backlogs}
                      </span>
                    </div>
                  </div>

                  {!selectedStudent.eligible &&
                    selectedStudent.reasons.length > 0 && (
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
                          Failure Reasons
                        </p>
                        <ul className="space-y-1" role="list">
                          {selectedStudent.reasons.map((reason, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2"
                            >
                              <span className="mt-1">•</span> {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center opacity-50">
                  <Bot
                    className="w-10 h-10 text-slate-400 mb-3"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-slate-500">
                    Select a student row to view agent explanation logs.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}