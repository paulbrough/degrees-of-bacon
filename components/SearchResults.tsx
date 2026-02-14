"use client";

import { useState } from "react";
import { ProductionCard } from "@/components/ProductionCard";
import { PersonCard } from "@/components/PersonCard";
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
      <div className="flex gap-2 border-b border-border pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`rounded-t px-4 py-2 text-sm font-medium transition-colors ${
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

      <div className="mt-6 flex flex-wrap gap-4">
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
