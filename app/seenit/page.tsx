"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { RatingBadge } from "@/components/RatingBadge";

interface SeenItEntry {
  id: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  year: string | null;
  rating: number | null;
  addedAt: string;
}

type SortField = "addedAt" | "title" | "year" | "rating";
type FilterType = "all" | "movie" | "tv";

export default function SeenItPage() {
  const [entries, setEntries] = useState<SeenItEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortField>("addedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      sort,
      order,
      filter,
      ...(search.trim() ? { q: search.trim() } : {}),
    });
    try {
      const res = await fetch(`/api/seenit?${params}`);
      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }
      if (!res.ok) {
        setError("Failed to load seen items. Please try again.");
        setEntries([]);
        return;
      }
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch {
      setError("Failed to load seen items. Please try again.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [sort, order, filter, search, router]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const removeEntry = async (tmdbId: number, mediaType: string) => {
    setEntries((prev) => prev.filter((e) => !(e.tmdbId === tmdbId && e.mediaType === mediaType)));
    try {
      await fetch("/api/seenit", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType }),
      });
    } catch {
      fetchEntries(); // Revert on error
    }
  };

  const toggleOrder = () => setOrder((o) => (o === "desc" ? "asc" : "desc"));

  const sortOptions: { label: string; value: SortField }[] = [
    { label: "Date Added", value: "addedAt" },
    { label: "Title", value: "title" },
    { label: "Year", value: "year" },
    { label: "Rating", value: "rating" },
  ];

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Movies", value: "movie" },
    { label: "TV Shows", value: "tv" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Seen It</h1>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Filter pills */}
        <div className="flex gap-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                filter === opt.value
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:bg-surface-hover"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortField)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={toggleOrder}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-muted hover:bg-surface-hover"
            title={order === "desc" ? "Descending" : "Ascending"}
          >
            {order === "desc" ? "\u2193" : "\u2191"}
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search seen titles..."
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent"
        />
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted">You haven&apos;t marked anything as seen.</p>
          <p className="mt-2 text-sm text-muted">
            Add movies and TV shows from their detail pages.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {entries.map((entry) => {
            const href = `/${entry.mediaType}/${entry.tmdbId}`;
            const imgUrl = tmdbImageUrl(entry.posterPath, "w185");
            return (
              <div key={entry.id} className="group flex gap-4 py-3">
                {/* Poster Thumbnail */}
                <Link
                  href={href}
                  className="relative h-[90px] w-[60px] shrink-0 overflow-hidden rounded bg-surface sm:h-[120px] sm:w-[80px]"
                >
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={entry.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">
                      No Image
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={href}
                      className="text-sm font-medium hover:text-accent-hover"
                    >
                      {entry.title}
                    </Link>
                    {entry.rating != null && entry.rating > 0 && (
                      <RatingBadge rating={entry.rating} />
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                    {entry.year && <span>{entry.year}</span>}
                    <span className="capitalize">{entry.mediaType}</span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeEntry(entry.tmdbId, entry.mediaType)}
                  className="shrink-0 self-start rounded-full bg-black/70 p-1.5 text-sm text-white transition-all hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Remove from seen"
                  aria-label={`Remove ${entry.title} from seen`}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
