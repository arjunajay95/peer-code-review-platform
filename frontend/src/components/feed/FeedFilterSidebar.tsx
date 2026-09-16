export type FeedFilterMode = "all" | "recommended" | "recent";

interface FeedFilterSidebarProps {
  mode: FeedFilterMode;
  onChange: (mode: FeedFilterMode) => void;
}

const OPTIONS: { mode: FeedFilterMode; label: string; icon: React.ReactNode }[] = [
  {
    mode: "all",
    label: "All Submissions",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    mode: "recommended",
    label: "Recommended",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 2l1.9 4.6L17 8l-4 3.4 1.2 5.1L10 13.8 5.8 16.5 7 11.4 3 8l5.1-1.4L10 2z" />
      </svg>
    ),
  },
  {
    mode: "recent",
    label: "Recent",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export function FeedFilterSidebar({ mode, onChange }: FeedFilterSidebarProps) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Filtered by</h3>
      <nav className="flex flex-col gap-1">
        {OPTIONS.map((option) => {
          const isSelected = mode === option.mode;
          return (
            <button
              key={option.mode}
              type="button"
              onClick={() => onChange(option.mode)}
              aria-current={isSelected ? "true" : undefined}
              className={`flex items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
