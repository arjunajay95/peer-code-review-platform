"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import Breadcrumbs from "@/components/Breadcrumbs";
import { createSubmissionFormSchema, type CreateSubmissionFormValues } from "@/schemas/submission.schema";
import TechnologyMultiSelect from "@/components/submissions/TechnologyMultiSelect";
import type { Submission } from "@/types/submission";

const inputClass =
  "mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default function NewSubmissionPage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSubmissionFormValues>({
    resolver: zodResolver(createSubmissionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      githubUrl: "",
      technologies: [],
      criteria: [{ label: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "criteria" });

  // Auth gating is UX only, proxy.ts already protects this route (AUTH §5),
  // the API enforces requireAuth again regardless.
  if (!isLoaded) return <div className="p-8 text-sm text-zinc-500">Loading…</div>;
  if (!userId) {
    router.push("/sign-in");
    return null;
  }

  const onSubmit = async (values: CreateSubmissionFormValues) => {
    setApiError(null);
    try {
      const { data } = await api.post<Submission>("/submissions", values);
      router.push(`/submissions/${data.id}`);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumbs items={[{ label: "New Submission" }]} />
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Post a review request</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Share your repo and the criteria you want feedback on. Criteria are locked once you post, you won&apos;t be
        able to add, edit, or remove them later.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
          <input {...register("title")} className={inputClass} placeholder="e.g. A small REST API in Express" />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
          <textarea
            {...register("description")}
            rows={5}
            className={inputClass}
            placeholder="What did you build? What kind of feedback are you looking for?"
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">GitHub URL</label>
          <input {...register("githubUrl")} className={inputClass} placeholder="https://github.com/you/repo" />
          {errors.githubUrl && <p className="mt-1 text-xs text-red-500">{errors.githubUrl.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Technologies</label>
          <Controller
            control={control}
            name="technologies"
            render={({ field }) => (
              <TechnologyMultiSelect value={field.value} onChange={field.onChange} error={errors.technologies?.message} />
            )}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Review criteria <span className="text-zinc-400">(1 to 5, locked after posting)</span>
            </label>
            <button
              type="button"
              onClick={() => fields.length < 5 && append({ label: "" })}
              disabled={fields.length >= 5}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Add criterion
            </button>
          </div>

          <div className="mt-2 space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <input
                    {...register(`criteria.${index}.label` as const)}
                    className={inputClass}
                    placeholder={`Criterion ${index + 1}, e.g. "Error handling"`}
                  />
                  {errors.criteria?.[index]?.label && (
                    <p className="mt-1 text-xs text-red-500">{errors.criteria[index]?.label?.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length <= 1}
                  className="mt-1 shrink-0 text-xs text-zinc-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Remove criterion ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {errors.criteria?.message && <p className="mt-1 text-xs text-red-500">{errors.criteria.message}</p>}
        </div>

        {apiError && (
          <p className=" bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{apiError}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className=" bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Posting…" : "Post request"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className=" border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
