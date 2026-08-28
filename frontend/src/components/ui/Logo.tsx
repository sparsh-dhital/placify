// frontend/src/components/ui/Logo.tsx
export function Logo({
  className = "w-9 h-9",
  iconSize = "w-5 h-5",
}: {
  className?: string;
  iconSize?: string;
}) {
  return (
    <div
      className={`bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden ${className}`}
    >
      {/* Mini SVG Monogram */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className={iconSize}
      >
        <path
          d="M11 9h5.5a4.5 4.5 0 0 1 0 9H11v5"
          fill="none"
          stroke="currentColor"
          className="text-white dark:text-slate-900"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="21" cy="23" r="2.5" fill="#22D3EE" />
      </svg>
    </div>
  );
}