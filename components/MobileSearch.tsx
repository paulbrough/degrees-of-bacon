"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import {
  getRecentClicks,
  addRecentClick,
  type RecentClick,
} from "@/lib/recent-clicks";

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

interface MobileSearchProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSearch({ open, onClose }: MobileSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentClicks, setRecentClicks] = useState<RecentClick[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setRecentClicks(getRecentClicks());
      // Small delay to let the overlay animate in before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results?.slice(0, 12) ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setResults([]);
    } else {
      debounceRef.current = setTimeout(() => fetchResults(value), 300);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleNavigate = (r: SearchResult) => {
    const updated = addRecentClick(r);
    setRecentClicks(updated);
    onClose();
  };

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

  if (!open) return null;

  const showRecents = query.length < 2 && recentClicks.length > 0;
  const items = showRecents ? recentClicks : results;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search movies, TV shows, people..."
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted outline-none focus:border-accent"
          />
        </form>
        <button
          onClick={onClose}
          className="shrink-0 px-2 py-2 text-sm text-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {showRecents && (
          <div className="px-4 pt-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted">
            Recent
          </div>
        )}
        {loading && (
          <div className="px-4 py-4 text-sm text-muted">Searching...</div>
        )}
        {!loading && !showRecents && results.length === 0 && query.length >= 2 && (
          <div className="px-4 py-4 text-sm text-muted">No results found</div>
        )}
        {!loading && query.length < 2 && recentClicks.length === 0 && (
          <div className="px-4 py-4 text-sm text-muted">Type at least 2 characters to search</div>
        )}
        {items.map((r) => {
          const imgUrl = getImageUrl(r);
          return (
            <Link
              key={`${r.media_type}-${r.id}`}
              href={getHref(r)}
              onClick={() => handleNavigate(r)}
              className="flex items-center gap-4 border-b border-border/50 px-4 py-3 transition-colors active:bg-surface-hover"
            >
              <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-border">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={getLabel(r)}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">
                    ?
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{getLabel(r)}</p>
                <p className="text-xs text-muted">{getSub(r)}</p>
              </div>
              <span className="shrink-0 text-xs text-muted">&rsaquo;</span>
            </Link>
          );
        })}
        {results.length > 0 && query.trim() && (
          <button
            onClick={() => {
              onClose();
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }}
            className="w-full px-4 py-4 text-center text-sm text-accent active:bg-surface-hover"
          >
            See all results for &ldquo;{query.trim()}&rdquo;
          </button>
        )}
      </div>
    </div>
  );
}
