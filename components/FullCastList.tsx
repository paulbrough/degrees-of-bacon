"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import type {
  TMDBCastMember,
  TMDBCrewMember,
  TMDBAggregateCastMember,
  TMDBAggregateCrewMember,
} from "@/lib/types/tmdb";

// Unified cast entry for display
interface CastEntry {
  id: number;
  name: string;
  profilePath: string | null;
  character: string;
  order: number;
  episodeCount?: number;
}

// Unified crew entry for display
interface CrewEntry {
  id: number;
  name: string;
  profilePath: string | null;
  jobs: string[];
  department: string;
  episodeCount?: number;
}

type Tab = "cast" | "crew";
type CastSort = "billing" | "episodes" | "name";
type CrewSort = "department" | "name";

interface FullCastListProps {
  title: string;
  year: string | null;
  posterPath: string | null;
  mediaType: "movie" | "tv";
  productionId: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
  aggregateCast?: TMDBAggregateCastMember[];
  aggregateCrew?: TMDBAggregateCrewMember[];
  filmYear: string | null;
  filmEndYear?: string | null;
}

function formatAge(
  birthday: string,
  filmYear: string,
  filmEndYear?: string | null
): string | null {
  const birthYear = parseInt(birthday.slice(0, 4), 10);
  const startYear = parseInt(filmYear, 10);
  if (isNaN(birthYear) || isNaN(startYear)) return null;
  const startAge = startYear - birthYear;
  if (filmEndYear && filmEndYear !== filmYear) {
    const endYear = parseInt(filmEndYear, 10);
    if (!isNaN(endYear)) {
      const endAge = endYear - birthYear;
      if (endAge !== startAge) {
        return `age ${startAge}\u2013${endAge}`;
      }
    }
  }
  return `age ${startAge}`;
}

export function FullCastList({
  title,
  year,
  posterPath,
  mediaType,
  productionId,
  cast,
  crew,
  aggregateCast,
  aggregateCrew,
  filmYear,
  filmEndYear,
}: FullCastListProps) {
  const [tab, setTab] = useState<Tab>("cast");
  const [castSort, setCastSort] = useState<CastSort>(
    mediaType === "tv" ? "episodes" : "billing"
  );
  const [crewSort, setCrewSort] = useState<CrewSort>("department");
  const [birthdays, setBirthdays] = useState<Record<number, string | null>>({});
  const [loadingAges, setLoadingAges] = useState(false);

  // Build unified cast entries
  const castEntries: CastEntry[] = useMemo(() => {
    if (mediaType === "tv" && aggregateCast && aggregateCast.length > 0) {
      return aggregateCast.map((m) => ({
        id: m.id,
        name: m.name,
        profilePath: m.profile_path,
        character: m.roles.map((r) => r.character).filter(Boolean).join(", ") || "",
        order: m.order,
        episodeCount: m.total_episode_count,
      }));
    }
    return cast.map((m) => ({
      id: m.id,
      name: m.name,
      profilePath: m.profile_path,
      character: m.character,
      order: m.order,
    }));
  }, [mediaType, aggregateCast, cast]);

  // Build unified crew entries (deduplicate by person id + department)
  const crewEntries: CrewEntry[] = useMemo(() => {
    if (mediaType === "tv" && aggregateCrew && aggregateCrew.length > 0) {
      return aggregateCrew.map((m) => ({
        id: m.id,
        name: m.name,
        profilePath: m.profile_path,
        jobs: m.jobs.map((j) => j.job),
        department: m.department,
        episodeCount: m.total_episode_count,
      }));
    }
    // Deduplicate regular crew by person + department
    const map = new Map<string, CrewEntry>();
    for (const m of crew) {
      const key = `${m.id}-${m.department}`;
      const existing = map.get(key);
      if (existing) {
        if (!existing.jobs.includes(m.job)) {
          existing.jobs.push(m.job);
        }
      } else {
        map.set(key, {
          id: m.id,
          name: m.name,
          profilePath: m.profile_path,
          jobs: [m.job],
          department: m.department,
        });
      }
    }
    return Array.from(map.values());
  }, [mediaType, aggregateCrew, crew]);

  // Sorted cast
  const sortedCast = useMemo(() => {
    const items = [...castEntries];
    switch (castSort) {
      case "billing":
        items.sort((a, b) => a.order - b.order);
        break;
      case "episodes":
        items.sort(
          (a, b) =>
            (b.episodeCount ?? 0) - (a.episodeCount ?? 0) || a.order - b.order
        );
        break;
      case "name":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return items;
  }, [castEntries, castSort]);

  // Sorted crew (grouped by department when sorting by department)
  const sortedCrew = useMemo(() => {
    const items = [...crewEntries];
    switch (crewSort) {
      case "department":
        items.sort(
          (a, b) => a.department.localeCompare(b.department) || a.name.localeCompare(b.name)
        );
        break;
      case "name":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return items;
  }, [crewEntries, crewSort]);

  // Grouped crew by department
  const crewByDepartment = useMemo(() => {
    if (crewSort !== "department") return null;
    const groups: { department: string; members: CrewEntry[] }[] = [];
    let current: { department: string; members: CrewEntry[] } | null = null;
    for (const entry of sortedCrew) {
      if (!current || current.department !== entry.department) {
        current = { department: entry.department, members: [] };
        groups.push(current);
      }
      current.members.push(entry);
    }
    return groups;
  }, [sortedCrew, crewSort]);

  // Fetch birthdays for visible people
  const visibleIds = tab === "cast" ? sortedCast.map((c) => c.id) : sortedCrew.map((c) => c.id);

  useEffect(() => {
    if (!filmYear) return;
    // Get IDs we haven't fetched yet
    const needed = visibleIds.filter((id) => !(id in birthdays));
    if (needed.length === 0) return;

    setLoadingAges(true);
    const batchSize = 20;
    const batches: number[][] = [];
    for (let i = 0; i < needed.length; i += batchSize) {
      batches.push(needed.slice(i, i + batchSize));
    }

    let cancelled = false;
    (async () => {
      for (const batch of batches) {
        if (cancelled) break;
        try {
          const res = await fetch(
            `/api/person/birthdays?ids=${batch.join(",")}`
          );
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) {
              setBirthdays((prev) => ({ ...prev, ...data }));
            }
          }
        } catch {
          // Silently fail — ages are supplemental
        }
      }
      if (!cancelled) setLoadingAges(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filmYear]);

  const posterUrl = tmdbImageUrl(posterPath, "w92");

  const castSortOptions: { label: string; value: CastSort }[] =
    mediaType === "tv"
      ? [
          { label: "Episode Count", value: "episodes" },
          { label: "Billing Order", value: "billing" },
          { label: "Name A-Z", value: "name" },
        ]
      : [
          { label: "Billing Order", value: "billing" },
          { label: "Name A-Z", value: "name" },
        ];

  const crewSortOptions: { label: string; value: CrewSort }[] = [
    { label: "Department", value: "department" },
    { label: "Name A-Z", value: "name" },
  ];

  return (
    <div>
      {/* Mini header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/${mediaType}/${productionId}`}
          className="group flex items-center gap-3 hover:text-accent-hover"
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title}
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
              {title}
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

      {/* Controls row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Tab pills */}
        <div className="flex gap-1">
          {(["cast", "crew"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                tab === t
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:bg-surface-hover"
              }`}
            >
              {t === "cast" ? `Cast (${castEntries.length})` : `Crew (${crewEntries.length})`}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={tab === "cast" ? castSort : crewSort}
          onChange={(e) => {
            if (tab === "cast") setCastSort(e.target.value as CastSort);
            else setCrewSort(e.target.value as CrewSort);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none"
        >
          {(tab === "cast" ? castSortOptions : crewSortOptions).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cast list */}
      {tab === "cast" && (
        <div className="divide-y divide-border">
          {sortedCast.map((entry) => {
            const imgUrl = tmdbImageUrl(entry.profilePath, "w185");
            const ageDisplay =
              filmYear && birthdays[entry.id]
                ? formatAge(birthdays[entry.id]!, filmYear, filmEndYear)
                : null;
            return (
              <div
                key={`${entry.id}-${entry.character}`}
                className="flex items-center gap-4 py-3"
              >
                <Link
                  href={`/person/${entry.id}`}
                  className="shrink-0"
                >
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={entry.name}
                      width={50}
                      height={75}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-[75px] w-[50px] items-center justify-center rounded bg-surface text-xs text-muted">
                      ?
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/person/${entry.id}`}
                    className="font-medium hover:text-accent-hover"
                  >
                    {entry.name}
                  </Link>
                  <p className="truncate text-sm text-muted">
                    {entry.character}
                    {ageDisplay != null && (
                      <span className="ml-2 text-xs">
                        ({ageDisplay})
                      </span>
                    )}
                    {ageDisplay == null && loadingAges && filmYear && (
                      <span className="ml-2 inline-block h-3 w-12 animate-pulse rounded bg-surface align-middle" />
                    )}
                  </p>
                  {entry.episodeCount != null && (
                    <p className="text-xs text-muted">
                      {entry.episodeCount} episode
                      {entry.episodeCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Crew list */}
      {tab === "crew" && crewByDepartment && (
        <div className="space-y-6">
          {crewByDepartment.map((group) => (
            <div key={group.department}>
              <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wider">
                {group.department}
              </h3>
              <div className="divide-y divide-border">
                {group.members.map((entry) => {
                  const imgUrl = tmdbImageUrl(entry.profilePath, "w185");
                  return (
                    <div
                      key={`${entry.id}-${entry.department}`}
                      className="flex items-center gap-4 py-3"
                    >
                      <Link
                        href={`/person/${entry.id}`}
                        className="shrink-0"
                      >
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={entry.name}
                            width={50}
                            height={75}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-[75px] w-[50px] items-center justify-center rounded bg-surface text-xs text-muted">
                            ?
                          </div>
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/person/${entry.id}`}
                          className="font-medium hover:text-accent-hover"
                        >
                          {entry.name}
                        </Link>
                        <p className="text-sm text-muted">
                          {entry.jobs.join(", ")}
                        </p>
                        {entry.episodeCount != null && (
                          <p className="text-xs text-muted">
                            {entry.episodeCount} episode
                            {entry.episodeCount !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crew flat list (sorted by name) */}
      {tab === "crew" && !crewByDepartment && (
        <div className="divide-y divide-border">
          {sortedCrew.map((entry) => {
            const imgUrl = tmdbImageUrl(entry.profilePath, "w185");
            return (
              <div
                key={`${entry.id}-${entry.department}`}
                className="flex items-center gap-4 py-3"
              >
                <Link
                  href={`/person/${entry.id}`}
                  className="shrink-0"
                >
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={entry.name}
                      width={50}
                      height={75}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-[75px] w-[50px] items-center justify-center rounded bg-surface text-xs text-muted">
                      ?
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/person/${entry.id}`}
                    className="font-medium hover:text-accent-hover"
                  >
                    {entry.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {entry.department} &middot; {entry.jobs.join(", ")}
                  </p>
                  {entry.episodeCount != null && (
                    <p className="text-xs text-muted">
                      {entry.episodeCount} episode
                      {entry.episodeCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
