// src/pages/admin/Exceptions.tsx
import { useState } from "react";
import { ShieldAlert, CheckCircle2, Bot, LoaderCircle } from "lucide-react";
import { approveDelayRecovery, simulateDelay } from "../../services/api";

export default function Exceptions() {
  const [roomId, setRoomId] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(20);
  const [proposal, setProposal] = useState<{
    proposed_changes: Array<Record<string, unknown>>;
    affected_interviews?: Array<Record<string, unknown>>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      setProposal(await simulateDelay(roomId, delayMinutes));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not simulate delay",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!proposal) return;
    setIsApproving(true);
    setError(null);
    try {
      await approveDelayRecovery(proposal.proposed_changes);
      setMessage("Recovery plan approved and applied.");
      setProposal(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not approve recovery",
      );
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-red-500" aria-hidden="true" />
          Exception Control Center
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-xl">
          Real-time monitoring of placement disruptions. Review AI recovery
          plans and execute resolutions instantly.
        </p>
      </div>

      <form
        onSubmit={handleSimulate}
        className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0A0A12]/80"
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_160px_auto] sm:items-end">
          <label className="space-y-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Room UUID
            <input
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              required
              placeholder="Paste room UUID"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal normal-case text-slate-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Delay minutes
            <input
              type="number"
              min="1"
              value={delayMinutes}
              onChange={(event) => setDelayMinutes(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal normal-case text-slate-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>
          <button
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}{" "}
            Simulate Delay
          </button>
        </div>
      </form>
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          {message}
        </p>
      )}
      {proposal && (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-xl dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex items-start gap-3">
            <Bot className="mt-1 h-5 w-5 text-amber-600" />
            <div>
              <h2 className="font-bold text-amber-900 dark:text-amber-200">
                Recovery proposal ready for review
              </h2>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-100">
                {proposal.proposed_changes.length} proposed changes affect{" "}
                {proposal.affected_interviews?.length || 0} interviews.
              </p>
            </div>
          </div>
          <pre className="mt-4 max-h-56 overflow-auto rounded-xl bg-white/70 p-4 text-xs text-slate-700 dark:bg-black/20 dark:text-slate-200">
            {JSON.stringify(proposal.proposed_changes, null, 2)}
          </pre>
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="mt-4 flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isApproving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}{" "}
            Approve Recovery
          </button>
        </div>
      )}
    </div>
  );
}
