"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useFeedFilters } from "@/store/feedFilters";
import { api } from "@/services/api";
import { FeedSubmission } from "@/types/feed";
import { FeedCard } from "@/components/feed/FeedCard";
import { FeedFilterSidebar, type FeedFilterMode } from "@/components/feed/FeedFilterSidebar";
import { TrendingSidebar } from "@/components/feed/TrendingSidebar";

export default function Home() {
  const { isLoaded, userId } = useAuthStore();
  const { search } = useFeedFilters();
  const [mode, setMode] = useState<FeedFilterMode>("all");

  const [feedData, setFeedData] = useState<FeedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAuthForRecommended, setNeedsAuthForRecommended] = useState(false);

  useEffect(() => {
    if (!isLoaded) return; // Wait for auth to resolve

    let isMounted = true;

    async function fetchFeed() {
      const hasFilters = search.trim().length > 0;

      // The personalized endpoint doesn't accept a search term, so a search
      // in progress always falls back to the public feed regardless of tab.
      const useRecommended = mode === "recommended" && !hasFilters;

      if (useRecommended && !userId) {
        if (isMounted) {
          setNeedsAuthForRecommended(true);
          setFeedData([]);
          setLoading(false);
          setError(null);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
        setError(null);
        setNeedsAuthForRecommended(false);
      }
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        // We'll append debug=1 in dev so we can see scores in the demo
        if (process.env.NODE_ENV !== "production") {
          params.append("debug", "1");
        }

        const queryString = params.toString();
        const endpoint = useRecommended ? `/feed/personalized?${queryString}` : `/feed?${queryString}`;

        const res = await api.get<FeedSubmission[]>(endpoint);

        if (isMounted && res.success) {
          setFeedData(res.data);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load feed";
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchFeed();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, userId, search, mode]);

  const showHero = isLoaded && !userId;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      {showHero && (
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Get your code <span className="text-indigo-600">reviewed</span>
            <br />
            by real developers.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-600 dark:text-zinc-400">CodeCritic is a peer review platform where developers share their work, give honest feedback, and earn karma for helping others grow.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/sign-up" className="bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
              Get started free
            </Link>
            <Link href="/sign-in" className="border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
              Sign in
            </Link>
          </div>
        </div>
      )}

      {!userId && (
        <div className={`grid gap-6 sm:grid-cols-3 ${showHero ? "mt-16" : ""}`}>
          {[
            { icon: "📝", title: "Submit your code", desc: "Share a GitHub repo, add review criteria, and get structured feedback from the community." },
            { icon: "🔍", title: "Review others", desc: "Browse open review requests, leave detailed feedback per criterion, and earn karma." },
            { icon: "⚡", title: "Earn karma", desc: "Every review you give earns you karma. A higher karma signals a trusted reviewer." },
          ].map((f) => (
            <div key={f.title} className="border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{f.title}</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      )}

      <div className={!userId ? "mt-16" : ""}>
        <div className={`grid grid-cols-1 gap-8 ${userId ? "lg:grid-cols-[180px_minmax(0,1fr)_260px]" : "lg:grid-cols-[180px_minmax(0,1fr)]"}`}>
          <aside className="hidden lg:block">
            <FeedFilterSidebar mode={mode} onChange={setMode} />
          </aside>

          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Community Feed</h2>

            {needsAuthForRecommended ? (
              <div className="border border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Sign in for recommendations</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400">
                    Sign in
                  </Link>{" "}
                  to see submissions matched to your tech stack.
                </p>
              </div>
            ) : loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 border border-zinc-200 bg-zinc-50 animate-pulse dark:border-zinc-800 dark:bg-zinc-900/50" />
                ))}
              </div>
            ) : error ? (
              <div className="border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">{error}</div>
            ) : feedData.length === 0 ? (
              <div className="border border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No submissions found</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Try adjusting your search or filters to find what you&apos;re looking for.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedData.map((item) => (
                  <FeedCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {userId && (
            <aside className="hidden lg:block">
              <TrendingSidebar />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
