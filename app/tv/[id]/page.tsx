import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { fetchTv } from "@/lib/fetch-production";
import { RatingBadge } from "@/components/RatingBadge";
import { IMDbRating } from "@/components/IMDbRating";
import { CastSection } from "@/components/CastSection";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { WatchListButton } from "@/components/WatchListButton";

export default async function TvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) notFound();

  let show;
  try {
    show = await fetchTv(tmdbId);
  } catch (error) {
    console.error("TV fetch error for ID", tmdbId, error);
    notFound();
  }

  const year = show.first_air_date?.slice(0, 4);
  const backdropUrl = tmdbImageUrl(show.backdrop_path, "original");
  const posterUrl = tmdbImageUrl(show.poster_path, "w500");

  const imdbId = show.external_ids?.imdb_id ?? null;

  const creators = show.created_by ?? [];
  const writers = show.credits?.crew?.filter(
    (c) => c.department === "Writing"
  )?.slice(0, 5) ?? [];
  const producers = show.credits?.crew?.filter(
    (c) => c.job === "Executive Producer"
  )?.slice(0, 5) ?? [];

  const seasonEpStr = [
    show.number_of_seasons ? `${show.number_of_seasons} season${show.number_of_seasons > 1 ? "s" : ""}` : null,
    show.number_of_episodes ? `${show.number_of_episodes} episodes` : null,
  ].filter(Boolean).join(" · ");

  return (
    <div>
      {/* Hero */}
      <div className="relative -mx-4 -mt-8 mb-8 overflow-hidden">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt=""
            fill
            priority
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative flex gap-8 px-4 py-12 sm:px-8 sm:py-16">
          {posterUrl && (
            <div className="relative hidden aspect-[2/3] w-[200px] shrink-0 overflow-hidden rounded-lg shadow-xl sm:block">
              <Image
                src={posterUrl}
                alt={show.name}
                fill
                priority
                sizes="200px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col justify-end gap-3">
            <h1 className="text-3xl font-bold sm:text-4xl">
              {show.name}
              {year && (
                <span className="ml-3 text-xl font-normal text-muted">
                  ({year})
                </span>
              )}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
              {show.genres?.map((g) => (
                <span key={g.id} className="rounded-full bg-surface px-3 py-1">
                  {g.name}
                </span>
              ))}
              {seasonEpStr && <span>{seasonEpStr}</span>}
            </div>

            {show.networks && show.networks.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>Network:</span>
                {show.networks.map((n) => (
                  <span key={n.id}>{n.name}</span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              {show.vote_average > 0 && (
                <RatingBadge rating={show.vote_average} label="TMDB" />
              )}
              <IMDbRating imdbId={imdbId} />
            </div>

            {show.tagline && (
              <p className="italic text-muted">{show.tagline}</p>
            )}

            {show.overview && (
              <p className="max-w-2xl text-sm leading-relaxed">
                {show.overview}
              </p>
            )}

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <WatchListButton
                tmdbId={show.id}
                mediaType="tv"
                title={show.name}
                posterPath={show.poster_path}
                year={year ?? null}
                rating={show.vote_average}
              />
              <Link
                href={`/compare?a=${show.id}&aType=tv`}
                className="mt-2 w-fit rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Compare with...
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Crew */}
      {(creators.length > 0 || writers.length > 0 || producers.length > 0) && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Key Crew</h2>
          <div className="flex flex-wrap gap-6 text-sm">
            {creators.length > 0 && (
              <div>
                <span className="text-muted">Creator{creators.length > 1 ? "s" : ""}</span>
                <div className="mt-1 flex gap-2">
                  {creators.map((c) => (
                    <Link key={c.id} href={`/person/${c.id}`} className="hover:text-accent-hover">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {writers.length > 0 && (
              <div>
                <span className="text-muted">Writers</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {writers.map((w) => (
                    <Link key={`${w.id}-${w.job}`} href={`/person/${w.id}`} className="hover:text-accent-hover">
                      {w.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {producers.length > 0 && (
              <div>
                <span className="text-muted">Executive Producers</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {producers.map((p) => (
                    <Link key={`${p.id}-${p.job}`} href={`/person/${p.id}`} className="hover:text-accent-hover">
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cast */}
      <div className="mb-8">
        <CastSection cast={show.credits?.cast ?? []} />
      </div>

      {/* Recommendations */}
      <RecommendationsSection
        items={show.recommendations?.results ?? []}
        mediaType="tv"
      />
    </div>
  );
}
