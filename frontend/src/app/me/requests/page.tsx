"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Technology { id: number; name: string; }
interface Submission {
  id: number; title: string; githubUrl: string; createdAt: string;
  technologies: Technology[];
  _count: { reviews: number };
}
interface Meta { page: number; limit: number; total: number; totalPages: number; }

export default function MyRequestsPage() {
  const { isLoaded, userId } = useAuthStore();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    api.get<Submission[]>(`/users/me/submissions?page=${page}&limit=20`)
      .then((res) => { setSubmissions(res.data); setMeta(res.meta ?? null); })
      .catch((err: Error) => setError(err.message));
  }, [isLoaded, userId, page]);

  if (!isLoaded) return <div className="p-8 text-sm text-zinc-500">Loading…</div>;
  if (!userId) return <div className="p-8 text-sm text-zinc-500"><Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">Sign in</Link> to view your submissions.</div>;
  if (error) return <div className="p-8 text-sm text-red-500">{error}</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumbs items={[{ label: "My Profile", href: "/me" }, { label: "My Submissions" }]} />
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">My submissions</h1>

      {submissions.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">
          No submissions yet.{" "}
          <Link href="/submissions/new" className="font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">Post one now.</Link>
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
          {submissions.map((s) => (
            <li key={s.id} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/submissions/${s.id}`} className="text-sm font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-50">
                    {s.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.technologies.map((t) => (
                      <span key={t.id} className=" bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{t.name}</span>
                    ))}
                  </div>
                </div>
                <span className={`shrink-0 px-2.5 py-0.5 text-xs font-medium ${s._count.reviews === 0 ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"}`}>
                  {s._count.reviews === 0 ? "Pending" : `${s._count.reviews} review${s._count.reviews > 1 ? "s" : ""}`}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{new Date(s.createdAt).toLocaleDateString()}</p>
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
