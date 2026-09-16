"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Review {
  id: number;
  feedback: string;
  createdAt: string;
  submission: { id: number; title: string };
}
interface Meta { page: number; limit: number; total: number; totalPages: number; }

export default function MyReviewsPage() {
  const { isLoaded, userId } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    api.get<Review[]>(`/users/me/reviews?page=${page}&limit=20`)
      .then((res) => { setReviews(res.data); setMeta(res.meta ?? null); })
      .catch((err: Error) => setError(err.message));
  }, [isLoaded, userId, page]);

  if (!isLoaded) return <div className="p-8 text-sm text-zinc-500">Loading…</div>;
  if (!userId) return (
    <div className="p-8 text-sm text-zinc-500">
      <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">Sign in</Link> to view your reviews.
    </div>
  );
  if (error) return <div className="p-8 text-sm text-red-500">{error}</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumbs items={[{ label: "My Profile", href: "/me" }, { label: "Reviews Given" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Reviews I&apos;ve given</h1>
        {meta && <span className="text-sm text-zinc-400">{meta.total} total</span>}
      </div>

      {reviews.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-sm text-zinc-500">You haven&apos;t reviewed any submissions yet.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">
            Browse the feed →
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
          {reviews.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500">
                    Review on{" "}
                    <Link href={`/submissions/${r.submission.id}`} className="font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">
                      {r.submission.title}
                    </Link>
                  </p>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">{r.feedback}</p>
                </div>
                <span className="shrink-0 text-xs text-zinc-400">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-6 flex gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className=" border border-zinc-300 px-4 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-700">Previous</button>
          <span className="py-1.5 text-sm text-zinc-500">{page} / {meta.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
            className=" border border-zinc-300 px-4 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-700">Next</button>
        </div>
      )}
    </div>
  );
}
