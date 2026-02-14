"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { RatingBadge } from "@/components/RatingBadge";
import type { TMDBPersonCreditAsCast, TMDBPersonCreditAsCrew } from "@/lib/types/tmdb";

type Filter = "all" | "movie" | "tv";

interface FilmographyProps {
  castCredits: TMDBPersonCreditAsCast[];
  crewCredits: TMDBPersonCreditAsCrew[];
}

function getYear(credit: TMDBPersonCreditAsCast | TMDBPersonCreditAsCrew): string {
  const date = "release_date" in credit
    ? (credit.release_date || credit.first_air_date)
    : (credit.release_date || credit.first_air_date);
  return date?.slice(0, 4) || "";
}

function getTitle(credit: TMDBPersonCreditAsCast | TMDBPersonCreditAsCrew): string {
  return credit.title || credit.name || "Untitled";
}

function getSortDate(credit: TMDBPersonCreditAsCast | TMDBPersonCreditAsCrew): string {
  return credit.release_date || credit.first_air_date || "0000";
}

export function Filmography({ castCredits, crewCredits }: FilmographyProps) {
  const [filter, setFilter] = useState<Filter>("all");

  // Deduplicate cast credits by production ID + media_type
  const uniqueCast = useMemo(() => {
    const seen = new Set<string>();
    return castCredits.filter((c) => {
      const key = `${c.media_type}-${c.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [castCredits]);

  const filteredCast = useMemo(
    () =>
      uniqueCast
        .filter((c) => filter === "all" || c.media_type === filter)
        .sort((a, b) => getSortDate(b).localeCompare(getSortDate(a))),
    [uniqueCast, filter]
  );

  const filteredCrew = useMemo(
    () =>
      crewCredits
        .filter((c) => filter === "all" || c.media_type === filter)
        .sort((a, b) => getSortDate(b).localeCompare(getSortDate(a))),
    [crewCredits, filter]
  );

  const filterButtons: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Movies", value: "movie" },
    { label: "TV", value: "tv" },
  ];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filmography</h2>
        <div className="flex gap-1">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                filter === btn.value
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:bg-surface-hover"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {filteredCast.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-muted">Acting</h3>
          <div className="space-y-1">
            {filteredCast.map((credit) => (
              <CreditRow
                key={`cast-${credit.media_type}-${credit.id}`}
                id={credit.id}
                mediaType={credit.media_type}
                title={getTitle(credit)}
                year={getYear(credit)}
                role={credit.character}
                posterPath={credit.poster_path}
                rating={credit.vote_average}
                episodeCount={credit.episode_count}
              />
            ))}
          </div>
        </div>
      )}

      {filteredCrew.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted">Crew</h3>
          <div className="space-y-1">
            {filteredCrew.map((credit) => (
              <CreditRow
                key={`crew-${credit.media_type}-${credit.id}-${credit.job}`}
                id={credit.id}
                mediaType={credit.media_type}
                title={getTitle(credit)}
                year={getYear(credit)}
                role={credit.job}
                posterPath={credit.poster_path}
                rating={credit.vote_average}
              />
            ))}
          </div>
        </div>
      )}

      {filteredCast.length === 0 && filteredCrew.length === 0 && (
        <p className="text-sm text-muted">No credits found for this filter.</p>
      )}
    </section>
  );
}

function CreditRow({
  id,
  mediaType,
  title,
  year,
  role,
  posterPath,
  rating,
  episodeCount,
}: {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  year: string;
  role: string;
  posterPath: string | null;
  rating: number;
  episodeCount?: number;
}) {
  const href = `/${mediaType}/${id}`;
  const imgUrl = tmdbImageUrl(posterPath, "w92");

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-hover"
    >
      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-surface">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={title}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-muted">
            ?
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{title}</span>
          {rating > 0 && <RatingBadge rating={rating} />}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          {year && <span>{year}</span>}
          {year && role && <span>·</span>}
          {role && <span className="truncate">{role}</span>}
          {episodeCount != null && episodeCount > 0 && (
            <>
              <span>·</span>
              <span>{episodeCount} ep{episodeCount !== 1 ? "s" : ""}</span>
            </>
          )}
        </div>
      </div>
      <span className="shrink-0 rounded bg-surface px-2 py-0.5 text-xs text-muted">
        {mediaType === "movie" ? "Movie" : "TV"}
      </span>
    </Link>
  );
}
