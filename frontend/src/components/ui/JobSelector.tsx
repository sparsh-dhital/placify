import { Briefcase } from "lucide-react";

interface JobSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function JobSelector({
  value,
  onChange,
  label = "Job UUID",
}: JobSelectorProps) {
  return (
    <label className="block min-w-0 space-y-2">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <Briefcase className="h-3.5 w-3.5 text-indigo-500" /> {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste the job UUID"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </label>
  );
}
