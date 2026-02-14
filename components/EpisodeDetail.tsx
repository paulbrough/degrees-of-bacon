import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { RatingBadge } from "@/components/RatingBadge";
import { CastSection } from "@/components/CastSection";
import type { TMDBEpisodeDetail, TMDBTvDetail } from "@/lib/types/tmdb";

interface EpisodeNav {
  seasonNumber: number;
  episodeNumber: number;
  label: string;
}

interface EpisodeDetailProps {
  episode: TMDBEpisodeDetail;
  show: TMDBTvDetail;
  prev: EpisodeNav | null;
  next: EpisodeNav | null;
}

export function EpisodeDetail({ episode, show, prev, next }: EpisodeDetailProps) {
  const posterUrl = tmdbImageUrl(show.poster_path, "w92");
  const stillUrl = tmdbImageUrl(episode.still_path, "original");
  const year = show.first_air_date?.slice(0, 4);

  const epLabel = `S${String(episode.season_number).padStart(2, "0")}E${String(episode.episode_number).padStart(2, "0")}`;

  // Key crew: directors and writers from episode crew
  const directors = episode.crew?.filter((c) => c.job === "Director") ?? [];
  const writers = episode.crew?.filter(
    (c) => c.department === "Writing"
  ) ?? [];

  // Guest stars: prefer credits.guest_stars, fall back to top-level
  const guestStars = episode.credits?.guest_stars ?? episode.guest_stars ?? [];

  // Stills gallery
  const stills = episode.images?.stills ?? [];

  return (
    <div>
      {/* Mini header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/tv/${show.id}`}
          className="group flex items-center gap-3 hover:text-accent-hover"
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={show.name}
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
              {show.name}
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

      {/* Episode still */}
      {stillUrl && (
        <div className="relative mx-auto mb-6 aspect-video max-w-3xl overflow-hidden rounded-lg bg-surface">
          <Image
            src={stillUrl}
            alt={episode.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      {/* Title + rating */}
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold">
          <span className="text-muted">{epLabel}</span>
          {" · "}
          {episode.name}
        </h2>
        {episode.vote_average > 0 && (
          <RatingBadge rating={episode.vote_average} />
        )}
      </div>

      {/* Metadata */}
      <div className="mb-4 flex flex-wrap gap-x-4 text-sm text-muted">
        {episode.air_date && (
          <span>
            {new Date(episode.air_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
        {episode.runtime != null && <span>{episode.runtime} min</span>}
      </div>

      {/* Overview */}
      {episode.overview && (
        <p className="mb-8 max-w-2xl text-sm leading-relaxed">
          {episode.overview}
        </p>
      )}

      {/* Prev/Next navigation */}
      <div className="mb-8 flex items-center justify-between gap-4">
        {prev ? (
          <Link
            href={`/tv/${show.id}/season/${prev.seasonNumber}/episode/${prev.episodeNumber}`}
            className="flex items-center gap-1 rounded-lg bg-surface px-4 py-2 text-sm transition-colors hover:bg-surface-hover"
          >
            <span>&larr;</span>
            <span className="hidden sm:inline">{prev.label}</span>
            <span className="sm:hidden">Prev</span>
          </Link>
        ) : (
          <div />
        )}
        <Link
          href={`/tv/${show.id}/episodes#season-${episode.season_number}`}
          className="text-sm text-muted hover:text-accent-hover"
        >
          All episodes
        </Link>
        {next ? (
          <Link
            href={`/tv/${show.id}/season/${next.seasonNumber}/episode/${next.episodeNumber}`}
            className="flex items-center gap-1 rounded-lg bg-surface px-4 py-2 text-sm transition-colors hover:bg-surface-hover"
          >
            <span className="hidden sm:inline">{next.label}</span>
            <span className="sm:hidden">Next</span>
            <span>&rarr;</span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Top Cast (series regulars) */}
      {(episode.credits?.cast ?? []).length > 0 && (
        <section className="mb-8">
          <CastSection
            cast={episode.credits?.cast ?? []}
            mediaType="tv"
            productionId={show.id}
            castUrl={`/tv/${show.id}/season/${episode.season_number}/episode/${episode.episode_number}/cast`}
            filmYear={episode.air_date?.slice(0, 4)}
          />
        </section>
      )}

      {/* Key Crew */}
      {(directors.length > 0 || writers.length > 0) && (
        <section className="mb-8">
          <h3 className="mb-3 text-lg font-semibold">Key Crew</h3>
          <div className="flex flex-wrap gap-6 text-sm">
            {directors.length > 0 && (
              <div>
                <span className="text-muted">
                  Director{directors.length > 1 ? "s" : ""}
                </span>
                <div className="mt-1 flex gap-2">
                  {directors.map((d) => (
                    <Link
                      key={d.id}
                      href={`/person/${d.id}`}
                      className="hover:text-accent-hover"
                    >
                      {d.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {writers.length > 0 && (
              <div>
                <span className="text-muted">
                  Writer{writers.length > 1 ? "s" : ""}
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {writers.map((w) => (
                    <Link
                      key={`${w.id}-${w.job}`}
                      href={`/person/${w.id}`}
                      className="hover:text-accent-hover"
                    >
                      {w.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Guest Stars */}
      {guestStars.length > 0 && (
        <section className="mb-8">
          <Link
            href={`/tv/${show.id}/season/${episode.season_number}/episode/${episode.episode_number}/cast`}
            className="group mb-4 flex items-center gap-2 text-lg font-semibold hover:text-accent-hover"
          >
            Guest Stars
            <span className="text-muted transition-transform group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {guestStars.map((member) => {
              const imgUrl = tmdbImageUrl(member.profile_path, "w185");
              return (
                <Link
                  key={`${member.id}-${member.character}`}
                  href={`/person/${member.id}`}
                  className="group w-[120px] shrink-0"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={member.name}
                        fill
                        sizes="120px"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted">
                        ?
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-sm font-medium group-hover:text-accent-hover">
                    {member.name}
                  </p>
                  {member.character && (
                    <p className="truncate text-xs text-muted">
                      {member.character}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Stills Gallery */}
      {stills.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-4 text-lg font-semibold">Stills</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {stills.map((img) => {
              const imgUrl = tmdbImageUrl(img.file_path, "w500");
              if (!imgUrl) return null;
              return (
                <div
                  key={img.file_path}
                  className="relative aspect-video w-[280px] shrink-0 overflow-hidden rounded-lg bg-surface sm:w-[360px]"
                >
                  <Image
                    src={imgUrl}
                    alt=""
                    fill
                    sizes="360px"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
