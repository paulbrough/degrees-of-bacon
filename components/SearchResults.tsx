"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductionCard } from "@/components/ProductionCard";
import { PersonCard } from "@/components/PersonCard";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { RatingBadge } from "@/components/RatingBadge";
import type {
  TMDBMultiSearchResult,
  TMDBMovieSearchResult,
  TMDBTvSearchResult,
  TMDBPersonSearchResult,
} from "@/lib/types/tmdb";

type Filter = "all" | "movie" | "tv" | "person";

interface SearchResultsProps {
  results: TMDBMultiSearchResult[];
}

function CompactResultItem({ result }: { result: TMDBMultiSearchResult }) {
  const isMovie = result.media_type === "movie";
  const isTv = result.media_type === "tv";
  const isPerson = result.media_type === "person";

  const title = isMovie
    ? (result as TMDBMovieSearchResult).title
    : isTv
      ? (result as TMDBTvSearchResult).name
      : (result as TMDBPersonSearchResult).name;

  const imgPath = isPerson
    ? (result as TMDBPersonSearchResult).profile_path
    : isMovie
      ? (result as TMDBMovieSearchResult).poster_path
      : (result as TMDBTvSearchResult).poster_path;

  const imgUrl = tmdbImageUrl(imgPath, "w92");
  const href = isPerson ? `/person/${result.id}` : `/${result.media_type}/${result.id}`;

  const year = isMovie
    ? (result as TMDBMovieSearchResult).release_date?.slice(0, 4)
    : isTv
      ? (result as TMDBTvSearchResult).first_air_date?.slice(0, 4)
      : null;

  const typeLabel = isMovie ? "Movie" : isTv ? "TV" : (result as TMDBPersonSearchResult).known_for_department || "Person";
  const rating = isPerson ? 0 : (result as TMDBMovieSearchResult | TMDBTvSearchResult).vote_average;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg bg-surface p-3 transition-colors hover:bg-surface-hover"
    >
      <div className={`relative shrink-0 overflow-hidden bg-border ${isPerson ? "h-14 w-14 rounded-full" : "h-16 w-11 rounded"}`}>
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={title || ""}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">?</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium group-hover:text-accent-hover">{title}</p>
        <p className="text-xs text-muted">
          {typeLabel}
          {year && ` · ${year}`}
        </p>
      </div>
      {rating > 0 && <RatingBadge rating={rating} />}
    </Link>
  );
}

export function SearchResults({ results }: SearchResultsProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const counts = {
    all: results.length,
    movie: results.filter((r) => r.media_type === "movie").length,
    tv: results.filter((r) => r.media_type === "tv").length,
    person: results.filter((r) => r.media_type === "person").length,
  };

  const filtered =
    activeFilter === "all"
      ? results
      : results.filter((r) => r.media_type === activeFilter);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "movie", label: "Movies" },
    { key: "tv", label: "TV Shows" },
    { key: "person", label: "People" },
  ];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto border-b border-border pb-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`shrink-0 rounded-t px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === tab.key
                ? "bg-surface text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}{" "}
            <span className="text-xs text-muted">({counts[tab.key]})</span>
          </button>
        ))}
      </div>

      {/* Mobile: compact list */}
      <div className="mt-4 flex flex-col gap-2 sm:hidden">
        {filtered.map((result) => (
          <CompactResultItem key={`${result.media_type}-${result.id}`} result={result} />
        ))}
      </div>

      {/* Desktop: card grid */}
      <div className="mt-6 hidden flex-wrap gap-4 sm:flex">
        {filtered.map((result) => {
          if (result.media_type === "movie") {
            const m = result as TMDBMovieSearchResult;
            return (
              <ProductionCard
                key={`movie-${m.id}`}
                id={m.id}
                mediaType="movie"
                title={m.title}
                posterPath={m.poster_path}
                year={m.release_date?.slice(0, 4) ?? null}
                rating={m.vote_average}
              />
            );
          }
          if (result.media_type === "tv") {
            const t = result as TMDBTvSearchResult;
            return (
              <ProductionCard
                key={`tv-${t.id}`}
                id={t.id}
                mediaType="tv"
                title={t.name}
                posterPath={t.poster_path}
                year={t.first_air_date?.slice(0, 4) ?? null}
                rating={t.vote_average}
              />
            );
          }
          const p = result as TMDBPersonSearchResult;
          return (
            <PersonCard
              key={`person-${p.id}`}
              id={p.id}
              name={p.name}
              profilePath={p.profile_path}
              knownForDepartment={p.known_for_department}
              knownFor={p.known_for?.map(
                (k) => ("title" in k ? k.title : k.name) || ""
              )}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-muted">No results in this category.</p>
      )}
    </div>
  );
}
