"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb-image";

interface SearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  known_for_department?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
      setResults(data.results?.slice(0, 8) ?? []);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function getHref(r: SearchResult) {
    if (r.media_type === "person") return `/person/${r.id}`;
    return `/${r.media_type}/${r.id}`;
  }

  function getLabel(r: SearchResult) {
    return r.title || r.name || "Unknown";
  }

  function getImageUrl(r: SearchResult) {
    if (r.media_type === "person") return tmdbImageUrl(r.profile_path ?? null, "w92");
    return tmdbImageUrl(r.poster_path ?? null, "w92");
  }

  function getSub(r: SearchResult) {
    if (r.media_type === "person") return r.known_for_department || "Person";
    const date = r.release_date || r.first_air_date;
    const year = date ? date.slice(0, 4) : "";
    const type = r.media_type === "movie" ? "Movie" : "TV";
    return [type, year].filter(Boolean).join(" · ");
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search movies, TV shows, people..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-accent"
        />
      </form>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
          {loading && (
            <div className="px-4 py-3 text-sm text-muted">Searching...</div>
          )}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-sm text-muted">No results found</div>
          )}
          {results.map((r) => {
            const imgUrl = getImageUrl(r);
            return (
              <Link
                key={`${r.media_type}-${r.id}`}
                href={getHref(r)}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-hover"
              >
                <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-border">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={getLabel(r)}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-muted">
                      ?
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{getLabel(r)}</p>
                  <p className="text-xs text-muted">{getSub(r)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
