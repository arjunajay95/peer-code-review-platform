"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/services/api";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Technology { id: number; name: string; }
interface PublicProfile {
  id: number; username: string; bio: string | null;
  githubUrl: string | null; karma: number; createdAt: string;
  technologies: Technology[];
  _count: { reviews: number; submissions: number };
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    api.get<PublicProfile>(`/users/${username}`)
      .then(({ data }) => setProfile(data))
      .catch((err: Error) => setError(err.message));
  }, [username]);

  if (error) return <div className="p-8 text-sm text-red-500">{error}</div>;
  if (!profile) return <div className="p-8 text-sm text-zinc-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumbs items={[{ label: `@${profile.username}` }]} />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{profile.username}</h1>
          {profile.bio && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{profile.bio}</p>}
          {profile.githubUrl && (
            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
              className="mt-1 block text-xs text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">
              {profile.githubUrl}
            </a>
          )}
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          ⚡ {profile.karma}
        </span>
      </div>

      {profile.technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.technologies.map((t) => (
            <span key={t.id} className=" bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {t.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-6">
        <div className="text-center">
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{profile._count.reviews}</p>
          <p className="text-xs text-zinc-500">Reviews given</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{profile._count.submissions}</p>
          <p className="text-xs text-zinc-500">Submissions</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{profile.karma}</p>
          <p className="text-xs text-zinc-500">Karma</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        Member since {new Date(profile.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
