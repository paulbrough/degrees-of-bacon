"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SeenItButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  year: string | null;
  rating: number;
}

export function SeenItButton({
  tmdbId,
  mediaType,
  title,
  posterPath,
  year,
  rating,
}: SeenItButtonProps) {
  const [hasSeen, setHasSeen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/seenit/check?tmdbId=${tmdbId}&mediaType=${mediaType}`)
      .then((res) => res.json())
      .then((data) => setHasSeen(data.hasSeen))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tmdbId, mediaType]);

  const toggle = async () => {
    const prev = hasSeen;

    try {
      if (prev) {
        const res = await fetch("/api/seenit", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId, mediaType }),
        });
        if (res.status === 401) { router.push("/auth/signin"); return; }
        if (!res.ok) throw new Error();
        setHasSeen(false);
      } else {
        const res = await fetch("/api/seenit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId, mediaType, title, posterPath, year, rating }),
        });
        if (res.status === 401) { router.push("/auth/signin"); return; }
        if (res.status === 409) { setHasSeen(true); return; } // genuinely already exists
        if (!res.ok) throw new Error();
        setHasSeen(true);
      }
    } catch {
      setHasSeen(prev); // Revert on error
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
        hasSeen
          ? "bg-accent text-white hover:bg-accent-hover"
          : "border border-accent text-accent hover:bg-accent/10"
      }`}
    >
      {hasSeen ? "Seen" : "Mark as Seen"}
    </button>
  );
}
