"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Technology { id: number; name: string; }
interface UserProfile {
  id: number; username: string; bio: string | null;
  githubUrl: string | null; karma: number; createdAt: string;
  technologies: Technology[];
  _count: { reviews: number; submissions: number };
}
interface RecentReview {
  id: number;
  createdAt: string;
  submission: { id: number; title: string; description: string; technologies: Technology[] };
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

export default function MePage() {
  const { isLoaded, userId, setUser } = useAuthStore();
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [techOptions, setTechOptions] = useState<Technology[]>([]);
  const [techInput, setTechInput] = useState("");

  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [editingAbout, setEditingAbout] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [aboutError, setAboutError] = useState<string | null>(null);

  const [reviewsReceivedCount, setReviewsReceivedCount] = useState<number | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentReview[]>([]);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    api.get<UserProfile>("/users/me")
      .then(({ data }) => setProfile(data))
      .catch((err: Error) => setError(err.message));
    api.get<Technology[]>("/technologies")
      .then(({ data }) => setTechOptions(data))
      .catch(() => setTechOptions([]));
    api.get<RecentReview[]>("/users/me/reviews-received?page=1&limit=1")
      .then((res) => setReviewsReceivedCount(res.meta?.total ?? 0))
      .catch(() => setReviewsReceivedCount(0));
    api.get<RecentReview[]>("/users/me/reviews?page=1&limit=5")
      .then((res) => setRecentActivity(res.data))
      .catch(() => setRecentActivity([]));
  }, [isLoaded, userId]);

  if (!isLoaded) return <div className="p-8 text-sm text-zinc-500">Loading…</div>;
  if (!userId) return <div className="p-8 text-sm text-zinc-500"><Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">Sign in</Link> to view your profile.</div>;
  if (error) return <div className="p-8 text-sm text-red-500">{error}</div>;
  if (!profile) return <div className="p-8 text-sm text-zinc-500">Loading…</div>;

  const startEditingUsername = () => {
    setUsernameInput(profile.username);
    setUsernameError(null);
    setEditingUsername(true);
  };

  const saveUsername = async () => {
    setUsernameError(null);
    try {
      const { data } = await api.patch<UserProfile>("/users/me", { username: usernameInput });
      setProfile(data);
      setUser({ id: data.id, username: data.username, karma: data.karma });
      setEditingUsername(false);
    } catch (err: unknown) {
      setUsernameError(err instanceof Error ? err.message : "Could not update username");
    }
  };

  const startEditingAbout = () => {
    setBioInput(profile.bio ?? "");
    setGithubInput(profile.githubUrl ?? "");
    setAboutError(null);
    setEditingAbout(true);
  };

  const saveAbout = async () => {
    setAboutError(null);
    try {
      const { data } = await api.patch<UserProfile>("/users/me", {
        bio: bioInput || null,
        githubUrl: githubInput || null,
      });
      setProfile(data);
      setEditingAbout(false);
    } catch (err: unknown) {
      setAboutError(err instanceof Error ? err.message : "Could not update profile");
    }
  };

  const updateTechnologies = async (nextIds: number[]) => {
    try {
      const { data } = await api.patch<UserProfile>("/users/me", { technologyIds: nextIds });
      setProfile(data);
    } catch {
      // The chip UI already reflects only committed state on the next render.
    }
  };

  const addTechnology = (tech: Technology) => {
    setTechInput("");
    updateTechnologies([...profile.technologies.map((t) => t.id), tech.id]);
  };

  const removeTechnology = (techId: number) => {
    updateTechnologies(profile.technologies.filter((t) => t.id !== techId).map((t) => t.id));
  };

  const suggestions = techOptions
    .filter((t) => !profile.technologies.some((existing) => existing.id === t.id))
    .filter((t) => t.name.includes(techInput.trim().toLowerCase()))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs items={[{ label: "My Profile" }]} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left column: identity */}
        <div className="flex flex-col gap-8">
          <div className="border border-zinc-200 p-6 text-center dark:border-zinc-800">
            <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-4xl font-semibold text-white">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={profile.username} className="h-full w-full object-cover" />
              ) : (
                profile.username.charAt(0).toUpperCase()
              )}
            </div>

            {editingUsername ? (
              <div className="mt-4">
                <input
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full border border-zinc-300 bg-white px-3 py-1.5 text-center text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                {usernameError && <p className="mt-1 text-xs text-red-500">{usernameError}</p>}
                <div className="mt-2 flex justify-center gap-2">
                  <button onClick={saveUsername} className="bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700">Save</button>
                  <button onClick={() => setEditingUsername(false)} className="border border-zinc-300 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{profile.username}</h1>
                <button onClick={startEditingUsername} className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">Edit username</button>
              </div>
            )}

            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              ⚡ {profile.karma}
            </span>
          </div>

          <div className="border border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Tech Stack</h2>
            <p className="mt-1 text-xs text-zinc-400">Used to compute your recommendation match score.</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {profile.technologies.map((t) => (
                <span key={t.id} className="inline-flex items-center gap-1 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {t.name}
                  <button type="button" onClick={() => removeTechnology(t.id)} aria-label={`Remove ${t.name}`} className="text-indigo-400 hover:text-indigo-700">×</button>
                </span>
              ))}
              {profile.technologies.length === 0 && <p className="text-xs text-zinc-400">No technologies added yet.</p>}
            </div>

            {profile.technologies.length < 10 && (
              <div className="mt-3">
                <input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Search technologies to add…"
                  className="w-full border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                {techInput.trim() && suggestions.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {suggestions.map((t) => (
                      <button key={t.id} type="button" onClick={() => addTechnology(t)}
                        className="border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-zinc-700 dark:text-zinc-400">
                        + {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">About</h2>
              {!editingAbout && <button onClick={startEditingAbout} className="text-xs text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">Edit</button>}
            </div>

            {editingAbout ? (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-500">Bio</label>
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500">GitHub URL</label>
                  <input
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    placeholder="https://github.com/yourname"
                    className="mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
                {aboutError && <p className="text-xs text-red-500">{aboutError}</p>}
                <div className="flex gap-2">
                  <button onClick={saveAbout} className="bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">Save</button>
                  <button onClick={() => setEditingAbout(false)} className="border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{profile.bio || "No bio yet."}</p>
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">
                    {profile.githubUrl}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column: activity */}
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-zinc-200 p-6 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Reviews Given</p>
                <svg className="h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  <path d="M15 6.75L17.25 9" />
                </svg>
              </div>
              <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{profile._count.reviews}</p>
            </div>
            <div className="border border-zinc-200 p-6 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Reviews Received</p>
                <svg className="h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </div>
              <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{reviewsReceivedCount ?? "…"}</p>
            </div>
          </div>

          <div className="border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Recent Activity</h2>
              <Link href="/me/reviews" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">View all</Link>
            </div>

            {recentActivity.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">You haven&apos;t reviewed any submissions yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
                {recentActivity.map((r) => (
                  <li key={r.id}>
                    <Link href={`/submissions/${r.submission.id}`} className="block -mx-6 px-6 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <div className="flex items-center justify-between gap-4">
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {r.submission.title}
                        </span>
                        <span className="shrink-0 text-xs text-zinc-400">{timeAgo(r.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {r.submission.description}
                      </p>
                      {r.submission.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {r.submission.technologies.map((t) => (
                            <span key={t.id} className="bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
