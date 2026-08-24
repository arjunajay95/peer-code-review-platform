"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { reviewFormSchema, type ReviewFormValues } from "@/schemas/review.schema";
import type { Criterion, ReviewResult } from "@/types/submission";

// B-12: the review form itself. Karma badge component belongs to Member A
// (TEAM_SCOPE_B §3), this only calls the `updateKarma` action she provides
// with the new total from the Workflow B response payload (BLUEPRINT §5).

interface ReviewFormProps {
  submissionId: number;
  criteria: Criterion[];
  onSubmitted: (review: ReviewResult) => void;
}

export default function ReviewForm({ submissionId, criteria, onSubmitted }: ReviewFormProps) {
  const updateKarma = useAuthStore((s) => s.updateKarma);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      feedback: "",
      strengths: "",
      improvements: "",
      resources: "",
      ratings: criteria.map((c) => ({ criterionId: c.id, rating: 0 })),
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    setApiError(null);
    try {
      const { data } = await api.post<ReviewResult>(`/submissions/${submissionId}/reviews`, values);
      // Reviews are immutable (D-15), this form only ever fires once per
      // submission per user; the API's DB-unique constraint is the real guard.
      updateKarma(data.reviewerKarma);
      onSubmitted(data);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-xs text-zinc-400">
        Reviews can&apos;t be edited or deleted once submitted, take a moment before sending this.
      </p>

      <div className="space-y-3">
        {criteria.map((criterion, index) => (
          <div key={criterion.id}>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{criterion.label}</label>
            <Controller control={control} name={`ratings.${index}.rating` as const}
              render={({ field }) => (
                <div className="mt-1 flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => field.onChange(n)}
                      aria-label={`Rate ${criterion.label} ${n} out of 5`}
                      className={`h-8 w-8 text-sm font-medium transition-colors ${
                        field.value >= n
                          ? "bg-indigo-600 text-white"
                          : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )} />
            {errors.ratings?.[index]?.rating && <p className="mt-1 text-xs text-red-500">{errors.ratings[index]?.rating?.message}</p>}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Feedback</label>
        <textarea
          {...register("feedback")}
          rows={4}
          className="mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="What worked, what didn't, and what you'd change (min. 10 characters)"
        />
        {errors.feedback && <p className="mt-1 text-xs text-red-500">{errors.feedback.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Strengths</label>
        <textarea
          {...register("strengths")}
          rows={3}
          className="mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="What did this submission do well? (min. 5 characters)"
        />
        {errors.strengths && <p className="mt-1 text-xs text-red-500">{errors.strengths.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Improvements</label>
        <textarea
          {...register("improvements")}
          rows={3}
          className="mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="What could be improved? (min. 5 characters)"
        />
        {errors.improvements && <p className="mt-1 text-xs text-red-500">{errors.improvements.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Resources (optional)</label>
        <textarea
          {...register("resources")}
          rows={2}
          className="mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          placeholder="Links or references that might help (max. 500 characters)"
        />
        {errors.resources && <p className="mt-1 text-xs text-red-500">{errors.resources.message}</p>}
      </div>

      {apiError && (
        <p className=" bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{apiError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className=" bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
