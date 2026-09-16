"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import Breadcrumbs from "@/components/Breadcrumbs";
import { updateSubmissionFormSchema, type UpdateSubmissionFormValues } from "@/schemas/submission.schema";
import TechnologyMultiSelect from "@/components/submissions/TechnologyMultiSelect";
import type { Submission, SubmissionDetail } from "@/types/submission";

const inputClass =
  "mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default function EditSubmissionPage() {
  const params = useParams<{ id: string }>();
  const submissionId = Number(params.id);
  const router = useRouter();
  const { isLoaded, userId } = useAuthStore();

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSubmissionFormValues>({ resolver: zodResolver(updateSubmissionFormSchema) });

  useEffect(() => {
    if (!Number.isFinite(submissionId)) return;
    api
      .get<SubmissionDetail>(`/submissions/${submissionId}`)
      .then(({ data }) => {
        setSubmission(data);
        reset({
          title: data.title,
          description: data.description,
          githubUrl: data.githubUrl,
          technologies: data.technologies.map((t) => t.name),
        });
      })
      .catch((err: Error) => setLoadError(err.message));
  }, [submissionId, reset]);

  if (loadError) return <div className="p-8 text-sm text-red-500">{loadError}</div>;
  if (!isLoaded || !submission) return <div className="p-8 text-sm text-zinc-500">Loading…</div>;

  // proxy.ts doesn't gate this route (only /submissions/new, /me, /settings
  // are in its matcher), so ownership is a UX check here, the API's 404
  // then 403 ordering (AUTH §3) is the real guard if someone reaches it anyway.
  if (!userId) {
    router.push("/sign-in");
    return null;
  }
  if (userId !== submission.authorId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-zinc-500">You can only edit your own submissions.</p>
      </div>
    );
  }

  const onSubmit = async (values: UpdateSubmissionFormValues) => {
    setApiError(null);
    try {
      const { data } = await api.put<Submission>(`/submissions/${submissionId}`, values);
      router.push(`/submissions/${data.id}`);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumbs items={[{ label: submission.title, href: `/submissions/${submission.id}` }, { label: "Edit" }]} />
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Edit submission</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
          <input {...register("title")} className={inputClass} />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
          <textarea {...register("description")} rows={5} className={inputClass} />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">GitHub URL</label>
          <input {...register("githubUrl")} className={inputClass} />
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
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Review criteria <span className="font-normal text-zinc-400">(locked, can&apos;t be changed)</span>
          </label>
          <p className="mt-1 text-xs text-zinc-400">
            Criteria are fixed the moment a submission is posted, so reviewers are always rating the same fixed
            scale, they can&apos;t be added, edited, or removed here.
          </p>
          <ul className="mt-2 space-y-1">
            {submission.criteria.map((c) => (
              <li
                key={c.id}
                className=" bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
              >
                {c.label}
              </li>
            ))}
          </ul>
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
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/submissions/${submissionId}`)}
            className=" border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
