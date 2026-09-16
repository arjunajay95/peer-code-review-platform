"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import Breadcrumbs from "@/components/Breadcrumbs";

const settingsSchema = z.object({
  username: z.string().min(3, "At least 3 characters").max(30, "At most 30 characters")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and underscores only").optional().or(z.literal("")),
  bio: z.string().max(300, "At most 300 characters").optional(),
  githubUrl: z.string().url("Must be a valid URL").startsWith("https://github.com/", "Must be a github.com URL")
    .optional().or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
interface UserProfile { id: number; username: string; bio: string | null; githubUrl: string | null; karma: number; createdAt: string; }

export default function SettingsPage() {
  const router = useRouter();
  const { isLoaded, userId, setUser } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<SettingsFormValues>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    if (!isLoaded || !userId) return;
    api.get<UserProfile>("/users/me").then(({ data }) => {
      reset({ username: data.username ?? "", bio: data.bio ?? "", githubUrl: data.githubUrl ?? "" });
    });
  }, [isLoaded, userId, reset]);

  if (!isLoaded) return <div className="p-8 text-sm text-zinc-500">Loading...</div>;
  if (!userId) { router.push("/sign-in"); return null; }

  const onSubmit = async (values: SettingsFormValues) => {
    setApiError(null);
    setSuccess(false);
    try {
      const payload: Record<string, string | null> = {};
      if (values.username) payload.username = values.username;
      if (values.bio !== undefined) payload.bio = values.bio || null;
      if (values.githubUrl !== undefined) payload.githubUrl = values.githubUrl || null;
      const { data } = await api.patch<UserProfile>("/users/me", payload);
      setUser({ id: data.id, username: data.username, karma: data.karma });
      setSuccess(true);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Breadcrumbs items={[{ label: "My Profile", href: "/me" }, { label: "Settings" }]} />
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Profile settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Username</label>
          <input {...register("username")} className="mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" placeholder="your_username" />
          {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
          <textarea {...register("bio")} rows={3} className="mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" placeholder="A short bio" />
          {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">GitHub URL</label>
          <input {...register("githubUrl")} className="mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" placeholder="https://github.com/yourname" />
          {errors.githubUrl && <p className="mt-1 text-xs text-red-500">{errors.githubUrl.message}</p>}
        </div>
        {apiError && <p className=" bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{apiError}</p>}
        {success && <p className=" bg-green-50 px-3 py-2 text-sm text-green-600 dark:bg-green-950 dark:text-green-400">Profile updated.</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting} className=" bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
          <button type="button" onClick={() => router.push("/me")} className=" border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
