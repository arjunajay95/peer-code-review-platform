import Link from "next/link";
import { FeedSubmission } from "@/types/feed";

interface FeedCardProps {
  item: FeedSubmission;
}

function timeAgo(dateStr: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.floor(diffDay / 365)}y ago`;
}

export function FeedCard({ item }: FeedCardProps) {
  const isReviewed = item._count.reviews > 0;

  return (
    <Link
      href={`/submissions/${item.id}`}
      className="flex group gap-3 border border-zinc-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        {item.author.username.charAt(0).toUpperCase()}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">@{item.author.username}</span>
            <span aria-hidden="true">&middot;</span>
            <span className="shrink-0">{timeAgo(item.createdAt)}</span>
            {item._score !== undefined && (
              <span className="shrink-0 font-mono text-indigo-500/70" title="Score (Debug Mode)">
                ⭐ {item._score.toFixed(3)}
              </span>
            )}
          </div>
          {isReviewed ? (
            <span className="inline-flex shrink-0 items-center bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/20">
              {item._count.reviews} review{item._count.reviews !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/20">
              Pending
            </span>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
            {item.title}
          </h3>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {item.technologies.map((tech) => {
            const isMatched = item.matchedTechnologies?.includes(tech.name);
            return (
              <span
                key={tech.id}
                className={`inline-flex items-center px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  isMatched
                    ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-indigo-500/30'
                    : 'bg-zinc-50 text-zinc-600 ring-zinc-500/10 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700'
                }`}
              >
                {tech.name}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
