"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";

interface PickedProduction {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  year: string | null;
}

interface ProductionPickerProps {
  label: string;
  selected: PickedProduction | null;
  onSelect: (production: PickedProduction) => void;
  onClear: () => void;
}

interface SearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
}

export function ProductionPicker({ label, selected, onSelect, onClear }: ProductionPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      // Filter to movies/TV only
      const filtered = (data.results ?? []).filter(
        (r: SearchResult) => r.media_type === "movie" || r.media_type === "tv"
      );
      setResults(filtered.slice(0, 8));
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), 300);
  };

  const handleSelect = (r: SearchResult) => {
    const date = r.release_date || r.first_air_date;
    onSelect({
      id: r.id,
      mediaType: r.media_type as "movie" | "tv",
      title: r.title || r.name || "Unknown",
      posterPath: r.poster_path ?? null,
      year: date?.slice(0, 4) ?? null,
    });
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (selected) {
    const imgUrl = tmdbImageUrl(selected.posterPath, "w92");
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-border">
          {imgUrl ? (
            <Image src={imgUrl} alt={selected.title} fill sizes="44px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted">?</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{selected.title}</p>
          <p className="text-xs text-muted">
            {selected.mediaType === "movie" ? "Movie" : "TV"}{selected.year ? ` · ${selected.year}` : ""}
          </p>
        </div>
        <button
          onClick={onClear}
          className="rounded-full bg-surface-hover p-1.5 text-xs text-muted hover:bg-border hover:text-foreground"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1 block text-sm font-medium text-muted">{label}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search for a movie or TV show..."
        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-accent"
      />
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
          {loading && <div className="px-4 py-3 text-sm text-muted">Searching...</div>}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-sm text-muted">No results found</div>
          )}
          {results.map((r) => {
            const imgUrl = tmdbImageUrl(r.poster_path ?? null, "w92");
            const title = r.title || r.name || "Unknown";
            const date = r.release_date || r.first_air_date;
            const year = date?.slice(0, 4);
            return (
              <button
                key={`${r.media_type}-${r.id}`}
                onClick={() => handleSelect(r)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-hover"
              >
                <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-border">
                  {imgUrl ? (
                    <Image src={imgUrl} alt={title} fill sizes="32px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-muted">?</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted">
                    {r.media_type === "movie" ? "Movie" : "TV"}{year ? ` · ${year}` : ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
