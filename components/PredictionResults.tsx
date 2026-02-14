"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb-image";

interface PredictionEntry {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  character: string;
  posterPath: string | null;
  year: string | null;
  score: number;
  taggedImagePath?: string | null;
}

interface PredictionData {
  confirmed: PredictionEntry[];
  likely: PredictionEntry[];
  possible: PredictionEntry[];
  watchListSize: number;
}

export function PredictionResults({ personId }: { personId: number }) {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (expanded && data) {
      setExpanded(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/predict/${personId}`);
      if (res.status === 401) { router.push("/auth/signin"); return; }
      if (!res.ok) throw new Error("Failed to load predictions");
      const result = await res.json();
      setData(result);
      setExpanded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {loading
          ? "Analyzing filmography..."
          : expanded
            ? "Hide Results"
            : "Where Do I Know Them From?"}
      </button>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {expanded && data && (
        <div className="mt-6 space-y-6">
          {data.watchListSize < 5 && (
            <p className="text-sm text-muted">
              Your watch list has {data.watchListSize} {data.watchListSize === 1 ? "item" : "items"}.
              Add more to get better predictions.
            </p>
          )}

          <TierSection icon="check" label="Confirmed" sublabel="On your watch list" entries={data.confirmed} />
          <TierSection icon="likely" label="Likely" sublabel="High probability you've seen" entries={data.likely} />
          <TierSection icon="possible" label="Possible" sublabel="You might have seen" entries={data.possible} />

          {data.confirmed.length === 0 && data.likely.length === 0 && data.possible.length === 0 && (
            <p className="text-sm text-muted">
              No matches found. Try adding more titles to your watch list.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TierSection({
  icon,
  label,
  sublabel,
  entries,
}: {
  icon: "check" | "likely" | "possible";
  label: string;
  sublabel: string;
  entries: PredictionEntry[];
}) {
  if (entries.length === 0) return null;

  const iconMap = {
    check: { symbol: "\u2705", color: "text-green-400" },
    likely: { symbol: "\uD83D\uDFE1", color: "text-yellow-400" },
    possible: { symbol: "\uD83D\uDD35", color: "text-blue-400" },
  };

  const { symbol, color } = iconMap[icon];

  return (
    <div>
      <h3 className={`mb-2 flex items-center gap-2 text-sm font-medium ${color}`}>
        <span>{symbol}</span>
        {label}
        <span className="font-normal text-muted">({entries.length}) — {sublabel}</span>
      </h3>
      <div className="space-y-1">
        {entries.map((entry) => {
          const posterUrl = tmdbImageUrl(entry.posterPath, "w92");
          const taggedUrl = entry.taggedImagePath
            ? tmdbImageUrl(entry.taggedImagePath, "w185")
            : null;

          return (
            <Link
              key={`${entry.mediaType}-${entry.id}`}
              href={`/${entry.mediaType}/${entry.id}`}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-hover"
            >
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-surface">
                {posterUrl ? (
                  <Image src={posterUrl} alt={entry.title} fill sizes="40px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-muted">?</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entry.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted">
                  {entry.year && <span>{entry.year}</span>}
                  {entry.character && (
                    <>
                      {entry.year && <span>·</span>}
                      <span className="truncate">as {entry.character}</span>
                    </>
                  )}
                </div>
              </div>
              {taggedUrl && (
                <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded">
                  <Image
                    src={taggedUrl}
                    alt={`Scene from ${entry.title}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              )}
              <span className="shrink-0 rounded bg-surface px-2 py-0.5 text-xs text-muted">
                {entry.mediaType === "movie" ? "Movie" : "TV"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
