import Link from "next/link";
import type { TMDBSeasonSummary } from "@/lib/types/tmdb";

interface EpisodeListSectionProps {
  showId: number;
  seasons: TMDBSeasonSummary[];
}

export function EpisodeListSection({ showId, seasons }: EpisodeListSectionProps) {
  // Filter out seasons with 0 episodes, sort specials (season 0) to the end
  const filtered = seasons
    .filter((s) => s.episode_count > 0)
    .sort((a, b) => {
      if (a.season_number === 0) return 1;
      if (b.season_number === 0) return -1;
      return a.season_number - b.season_number;
    });

  if (filtered.length === 0) return null;

  return (
    <section>
      <Link
        href={`/tv/${showId}/episodes`}
        className="group mb-4 flex items-center gap-2 text-lg font-semibold hover:text-accent-hover"
      >
        Episode List
        <span className="text-muted transition-transform group-hover:translate-x-0.5">
          &rarr;
        </span>
      </Link>
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {filtered.map((season) => (
          <Link
            key={season.id}
            href={`/tv/${showId}/episodes#season-${season.season_number}`}
            className="shrink-0 rounded-full bg-surface px-4 py-2 text-sm transition-colors hover:bg-surface-hover"
          >
            <span className="font-medium">{season.name}</span>
            <span className="ml-2 text-muted">
              {season.episode_count} ep{season.episode_count !== 1 ? "s" : ""}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
