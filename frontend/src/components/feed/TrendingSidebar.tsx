"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import type { TrendingReviewedSubmission } from "@/types/feed";

export function TrendingSidebar() {
  const [items, setItems] = useState<TrendingReviewedSubmission[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api
      .get<TrendingReviewedSubmission[]>("/submissions/me/trending-reviewed")
      .then(({ data }) => {
        if (isMounted) setItems(data);
      })
      .catch(() => {
        if (isMounted) setItems([]);
      })
      .finally(() => {
        if (isMounted) setLoaded(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loaded && items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Trending</h3>
      <div className="flex flex-col gap-3">
        {!loaded
          ? [1, 2, 3].map((i) => (
              <div key={i} className="h-16 border border-zinc-200 bg-zinc-50 animate-pulse dark:border-zinc-800 dark:bg-zinc-900/50" />
            ))
          : items.map((item) => (
              <Link
                key={item.id}
                href={`/submissions/${item.id}`}
                className="block border border-zinc-200 p-3 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-800"
              >
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{item.title}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {item.reviewCount} review{item.reviewCount !== 1 ? "s" : ""}
                </p>
              </Link>
            ))}
      </div>
    </div>
  );
}
