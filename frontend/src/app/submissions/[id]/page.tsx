"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import Breadcrumbs from "@/components/Breadcrumbs";
import ReviewForm from "@/components/submissions/ReviewForm";
import type { SubmissionDetail, ReviewResult } from "@/types/submission";

function timeAgo(dateStr: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const plural = (n: number, unit: string) => `${n} ${unit}${n !== 1 ? "s" : ""} ago`;

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return plural(diffMin, "minute");
  if (diffHour < 24) return plural(diffHour, "hour");
  if (diffDay < 30) return plural(diffDay, "day");
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return plural(diffMonth, "month");
  return plural(Math.floor(diffDay / 365), "year");
}

function Avatar({ username, imageUrl }: { username: string; imageUrl?: string | null }) {
  return <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{imageUrl ? <img src={imageUrl} alt={username} className="h-full w-full object-cover" /> : username.charAt(0).toUpperCase()}</div>;
}

const RADIAL_SIZE = 88;
const RADIAL_RADIUS = 36;
const RADIAL_CIRCUMFERENCE = 2 * Math.PI * RADIAL_RADIUS;

function RadialProgress({ average, count }: { average: number; count: number }) {
  const percent = (average / 5) * 100;
  const offset = RADIAL_CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className="relative h-22 w-22">
      <svg width={RADIAL_SIZE} height={RADIAL_SIZE} viewBox="0 0 88 88" className="-rotate-90">
        <circle cx="44" cy="44" r={RADIAL_RADIUS} fill="none" strokeWidth="8" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
        <circle cx="44" cy="44" r={RADIAL_RADIUS} fill="none" strokeWidth="8" strokeLinecap="round" stroke="currentColor" className="text-indigo-600 transition-all dark:text-indigo-500" strokeDasharray={RADIAL_CIRCUMFERENCE} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{count > 0 ? average.toFixed(1) : "-"}</span>
        <span className="text-[10px] text-zinc-400">/ 5</span>
      </div>
    </div>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = Number(params.id);
  const { isLoaded, userId } = useAuthStore();
  const { user } = useUser();

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(submissionId)) return;
    api
      .get<SubmissionDetail>(`/submissions/${submissionId}`)
      .then(({ data }) => setSubmission(data))
      .catch((err: Error) => setError(err.message));
  }, [submissionId]);

  if (error) return <div className="p-8 text-sm text-red-500">{error}</div>;
  if (!submission) return <div className="p-8 text-sm text-zinc-500">Loading…</div>;

  const isOwner = isLoaded && userId === submission.authorId;
  const hasReviewed = isLoaded && submission.reviews.some((r) => r.reviewer.id === userId);

  const criterionAverages = submission.criteria.map((criterion) => {
    const ratings = submission.reviews
      .flatMap((r) => r.ratings)
      .filter((rating) => rating.criterionId === criterion.id)
      .map((rating) => rating.rating);
    const average = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    return { criterion, average, count: ratings.length };
  });

  const handleReviewSubmitted = (review: ReviewResult) => {
    setToast("Review submitted, thanks for the feedback.");
    setSubmission((prev) =>
      prev
        ? {
            ...prev,
            status: "REVIEWED",
            reviews: [
              {
                id: review.id,
  feedback: review.feedback,
  strengths: review.strengths ?? "",
  improvements: review.improvements ?? "",
  resources: review.resources,
  createdAt: review.createdAt,
  reviewer: { id: userId!, username: useAuthStore.getState().username ?? "you" },
  ratings: review.ratings,
              },
              ...prev.reviews,
            ],
          }
        : prev,
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={[{ label: submission.title }]} />

      {toast && <div className="mb-6 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">{toast}</div>}

      <div className="flex flex-col gap-6">
        <div className="py-2 px-1">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{submission.title}</h1>
            <span className={`shrink-0 px-2.5 py-0.5 text-xs font-medium ${submission.status === "PENDING" ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"}`}>{submission.status === "PENDING" ? "Pending" : `${submission.reviews.length} review${submission.reviews.length > 1 ? "s" : ""}`}</span>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{submission.authorId === userId && user?.imageUrl ? <img src={user.imageUrl} alt={submission.author.username} className="h-full w-full object-cover" /> : submission.author.username.charAt(0).toUpperCase()}</div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Link href={`/profile/${submission.author.username}`} className="font-medium text-zinc-700 hover:text-indigo-600 dark:text-zinc-300">
                @{submission.author.username}
              </Link>
              <span aria-hidden="true">&middot;</span>
              <span>posted {timeAgo(submission.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Tech Stack</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {submission.technologies.map((t) => (
              <span key={t.id} className="bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {t.name}
              </span>
            ))}
          </div>
        </div>

        <div className="border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{submission.description}</p>

          <a href={submission.githubUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">
            View on GitHub →
          </a>

          {isOwner && (
            <div className="mt-4">
              <Link href={`/submissions/${submission.id}/edit`} className="border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
                Edit submission
              </Link>
            </div>
          )}
        </div>

        <div className="border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Review Criteria</h2>
          <div className="mt-4 flex flex-wrap justify-around gap-6">
            {criterionAverages.map(({ criterion, average, count }) => (
              <div key={criterion.id} className="flex flex-col items-center gap-2">
                <RadialProgress average={average} count={count} />
                <span className="max-w-26 text-center text-xs font-medium text-zinc-600 dark:text-zinc-400">{criterion.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {submission.reviews.length} review{submission.reviews.length !== 1 ? "s" : ""}
          </h2>

          <div className="mt-4">
            {!isLoaded ? null : !userId ? (
              <p className="text-sm text-zinc-500">
                <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">
                  Sign in
                </Link>{" "}
                to leave a review.
              </p>
            ) : isOwner ? (
              <p className="bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-900">This is your own submission, you can&apos;t review it.</p>
            ) : hasReviewed ? (
              <p className="bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-900">You&apos;ve already reviewed this submission.</p>
            ) : (
              <ReviewForm submissionId={submission.id} criteria={submission.criteria} onSubmitted={handleReviewSubmitted} />
            )}
          </div>

          {submission.reviews.length === 0 ? (
            <p className="mt-6 border-t border-zinc-200 pt-4 text-sm text-zinc-500 dark:border-zinc-800">No reviews yet.</p>
          ) : (
            <ul className="mt-6 divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {submission.reviews.map((r) => (
                <li key={r.id} className="flex gap-3 py-4">
                  <Avatar username={r.reviewer.username} imageUrl={r.reviewer.id === userId ? user?.imageUrl : undefined} />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/profile/${r.reviewer.username}`} className="text-sm font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-50">
                        @{r.reviewer.username}
                      </Link>
                      <span aria-hidden="true" className="text-zinc-400">
                        &middot;
                      </span>
                      <span className="text-xs text-zinc-400">{timeAgo(r.createdAt)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.ratings.map((rating) => {
                        const criterion = submission.criteria.find((c) => c.id === rating.criterionId);
                        return (
                          <span key={rating.criterionId} className="bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {criterion?.label ?? "Criterion"}: {rating.rating}/5
                          </span>
                        );
                      })}
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{r.feedback}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
