import { Search, Bell, User } from "lucide-react";

export default function Topbar() {
  return (
    <header
      className="h-16 bg-[#080B12] border-b border-[#253047] flex items-center justify-between px-8 flex-shrink-0"
      aria-label="Top Navigation"
    >
      <div className="flex-1 flex items-center">
        <div className="relative w-64 max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search
              className="h-4 w-4 text-text-secondary"
              aria-hidden="true"
            />
          </div>
          <input
            type="search"
            placeholder="Search placements, candidates..."
            className="block w-full pl-9 pr-3 py-1.5 bg-[#0D111A] border border-[#253047] rounded-md text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-colors"
            aria-label="Global search"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#0D111A] rounded-full border border-[#253047]">
          <span
            className="w-2 h-2 rounded-full bg-semantic-success animate-pulse"
            aria-hidden="true"
          ></span>
          <span className="text-xs font-medium text-text-secondary">
            2026 Drive Active
          </span>
        </div>

        <button
          className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-[#111827] transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary relative"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-primary border border-[#080B12]"></span>
        </button>

        <button
          className="w-8 h-8 rounded-full bg-[#111827] border border-[#253047] flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
          aria-label="User profile menu"
        >
          <User className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}