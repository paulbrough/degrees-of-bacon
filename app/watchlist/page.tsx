"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { RatingBadge } from "@/components/RatingBadge";

interface WatchListEntry {
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

export default function WatchListPage() {
  const [entries, setEntries] = useState<WatchListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortField>("addedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      sort,
      order,
      filter,
      ...(search.trim() ? { q: search.trim() } : {}),
    });
    try {
      const res = await fetch(`/api/watchlist?${params}`);
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [sort, order, filter, search]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const removeEntry = async (tmdbId: number, mediaType: string) => {
    setEntries((prev) => prev.filter((e) => !(e.tmdbId === tmdbId && e.mediaType === mediaType)));
    try {
      await fetch("/api/watchlist", {
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
      <h1 className="mb-6 text-2xl font-bold">Watch List</h1>

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
          placeholder="Search watch list..."
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent"
        />
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted">Your watch list is empty.</p>
          <p className="mt-2 text-sm text-muted">
            Add movies and TV shows from their detail pages.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {entries.map((entry) => {
            const href = `/${entry.mediaType}/${entry.tmdbId}`;
            const imgUrl = tmdbImageUrl(entry.posterPath, "w342");
            return (
              <div key={entry.id} className="group relative">
                <Link href={href} className="block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={entry.title}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="truncate text-sm font-medium group-hover:text-accent-hover">
                      {entry.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {entry.year && <span className="text-xs text-muted">{entry.year}</span>}
                      {entry.rating != null && entry.rating > 0 && (
                        <RatingBadge rating={entry.rating} />
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => removeEntry(entry.tmdbId, entry.mediaType)}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1.5 text-xs text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  title="Remove from watch list"
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
