"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { RatingBadge } from "@/components/RatingBadge";
import type { TMDBSeasonDetail } from "@/lib/types/tmdb";

interface EpisodeListProps {
  showTitle: string;
  showId: number;
  posterPath: string | null;
  year: string | null;
  seasons: TMDBSeasonDetail[];
}

export function EpisodeList({
  showTitle,
  showId,
  posterPath,
  year,
  seasons,
}: EpisodeListProps) {
  // Sort: specials (season 0) to end
  const sorted = [...seasons].sort((a, b) => {
    if (a.season_number === 0) return 1;
    if (b.season_number === 0) return -1;
    return a.season_number - b.season_number;
  });

  const [activeSeason, setActiveSeason] = useState(
    sorted[0]?.season_number ?? 0
  );
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(
    new Set()
  );
  const sectionRefs = useRef<Map<number, HTMLElement>>(new Map());
  const isScrollingRef = useRef(false);

  const posterUrl = tmdbImageUrl(posterPath, "w92");

  // Handle hash-based scroll on mount
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#season-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const el = sectionRefs.current.get(num);
      if (el) {
        // Small delay to let layout settle
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
          setActiveSeason(num);
        }, 100);
      }
    }
  }, []);

  // IntersectionObserver to track which season is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const num = Number(entry.target.getAttribute("data-season"));
            if (!isNaN(num)) {
              setActiveSeason(num);
            }
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    for (const el of sectionRefs.current.values()) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sorted]);

  const handleSeasonSelect = useCallback((seasonNumber: number) => {
    setActiveSeason(seasonNumber);
    const el = sectionRefs.current.get(seasonNumber);
    if (el) {
      isScrollingRef.current = true;
      el.scrollIntoView({ behavior: "smooth" });
      // Re-enable observer after scroll settles
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  }, []);

  const toggleEpisode = useCallback((episodeId: number) => {
    setExpandedEpisodes((prev) => {
      const next = new Set(prev);
      if (next.has(episodeId)) {
        next.delete(episodeId);
      } else {
        next.add(episodeId);
      }
      return next;
    });
  }, []);

  return (
    <div>
      {/* Mini header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/tv/${showId}`}
          className="group flex items-center gap-3 hover:text-accent-hover"
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={showTitle}
              width={46}
              height={69}
              className="rounded"
            />
          ) : (
            <div className="flex h-[69px] w-[46px] items-center justify-center rounded bg-surface text-xs text-muted">
              ?
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold group-hover:text-accent-hover">
              {showTitle}
              {year && (
                <span className="ml-2 text-sm font-normal text-muted">
                  ({year})
                </span>
              )}
            </h1>
            <p className="text-sm text-muted">&larr; Back to details</p>
          </div>
        </Link>
      </div>

      {/* Sticky season dropdown */}
      <div className="sticky top-[64px] z-10 -mx-4 border-b border-border bg-background px-4 py-3">
        <select
          value={activeSeason}
          onChange={(e) => handleSeasonSelect(Number(e.target.value))}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none"
        >
          {sorted.map((season) => (
            <option key={season.season_number} value={season.season_number}>
              {season.name} ({season.episodes.length} episode
              {season.episodes.length !== 1 ? "s" : ""})
            </option>
          ))}
        </select>
      </div>

      {/* Season sections */}
      <div className="mt-4 space-y-10">
        {sorted.map((season) => {
          const airYear = season.air_date?.slice(0, 4);
          return (
            <section
              key={season.season_number}
              ref={(el) => {
                if (el) sectionRefs.current.set(season.season_number, el);
              }}
              data-season={season.season_number}
            >
              <h2 className="sticky top-[120px] z-[5] -mx-4 bg-background px-4 py-2 text-base font-semibold">
                {season.name}
                {airYear && (
                  <span className="ml-2 text-sm font-normal text-muted">
                    ({airYear})
                  </span>
                )}
                <span className="ml-2 text-sm font-normal text-muted">
                  &middot; {season.episodes.length} episode
                  {season.episodes.length !== 1 ? "s" : ""}
                </span>
              </h2>

              <div className="mt-2 divide-y divide-border">
                {season.episodes.map((ep) => {
                  const stillUrl = tmdbImageUrl(ep.still_path, "w185");
                  const isExpanded = expandedEpisodes.has(ep.id);
                  const hasLongOverview =
                    ep.overview && ep.overview.length > 150;

                  return (
                    <div key={ep.id} className="flex gap-4 py-3">
                      {/* Still image */}
                      <div className="relative aspect-video w-[120px] shrink-0 overflow-hidden rounded bg-surface sm:w-[160px]">
                        {stillUrl ? (
                          <Image
                            src={stillUrl}
                            alt={ep.name}
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Episode info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            {ep.episode_number}. {ep.name}
                          </span>
                          {ep.vote_average > 0 && (
                            <RatingBadge rating={ep.vote_average} />
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                          {ep.air_date && (
                            <span>
                              {new Date(ep.air_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          )}
                          {ep.runtime != null && <span>{ep.runtime}m</span>}
                        </div>

                        {ep.overview && (
                          <p className="mt-1.5 text-sm text-muted">
                            {hasLongOverview && !isExpanded
                              ? ep.overview.slice(0, 150) + "..."
                              : ep.overview}
                            {hasLongOverview && (
                              <button
                                onClick={() => toggleEpisode(ep.id)}
                                className="ml-1 text-accent hover:text-accent-hover"
                              >
                                {isExpanded ? "Show less" : "Show more"}
                              </button>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
