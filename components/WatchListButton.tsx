"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface WatchListButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  year: string | null;
  rating: number;
}

export function WatchListButton({
  tmdbId,
  mediaType,
  title,
  posterPath,
  year,
  rating,
}: WatchListButtonProps) {
  const [onList, setOnList] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/watchlist/check?tmdbId=${tmdbId}&mediaType=${mediaType}`)
      .then((res) => res.json())
      .then((data) => setOnList(data.onWatchList))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tmdbId, mediaType]);

  const toggle = async () => {
    const prev = onList;
    setOnList(!prev); // Optimistic

    try {
      if (prev) {
        const res = await fetch("/api/watchlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId, mediaType }),
        });
        if (res.status === 401) { router.push("/auth/signin"); return; }
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId, mediaType, title, posterPath, year, rating }),
        });
        if (res.status === 401) { router.push("/auth/signin"); return; }
        // 409 means already on list — treat as success
        if (!res.ok && res.status !== 409) throw new Error();
      }
    } catch {
      setOnList(prev); // Revert on error
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="mt-2 w-fit rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted"
      >
        ...
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`mt-2 w-fit rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        onList
          ? "bg-accent text-white hover:bg-accent-hover"
          : "border border-accent text-accent hover:bg-accent/10"
      }`}
    >
      {onList ? "On Watch List" : "Add to Watch List"}
    </button>
  );
}
