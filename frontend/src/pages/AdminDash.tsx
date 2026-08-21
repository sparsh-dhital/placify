export default function AdminDash() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 flex flex-col min-h-full">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Good morning, Placement Officer.
        </h1>
        <p className="text-sm text-text-secondary">
          Here is what's happening with the 2026 Placement Drive today.
        </p>
      </header>

      {/* 
        This is where we will inject the KPI Cards, AI Operations Status, 
        and Exception Center in the next steps. 
      */}
      <div className="flex-1 rounded-xl border border-dashed border-[#253047] flex items-center justify-center">
        <span className="text-text-secondary text-sm">
          Dashboard Widgets Configuration Pending
        </span>
      </div>
    </div>
  );
}