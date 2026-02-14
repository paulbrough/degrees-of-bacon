import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { fetchMovie } from "@/lib/fetch-production";
import { RatingBadge } from "@/components/RatingBadge";
import { IMDbRating } from "@/components/IMDbRating";
import { CastSection } from "@/components/CastSection";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { WatchListButton } from "@/components/WatchListButton";

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) notFound();

  let movie;
  try {
    movie = await fetchMovie(tmdbId);
  } catch {
    notFound();
  }

  const year = movie.release_date?.slice(0, 4);
  const backdropUrl = tmdbImageUrl(movie.backdrop_path, "original");
  const posterUrl = tmdbImageUrl(movie.poster_path, "w500");

  const directors = movie.credits?.crew?.filter((c) => c.job === "Director") ?? [];
  const writers = movie.credits?.crew?.filter(
    (c) => c.department === "Writing"
  )?.slice(0, 5) ?? [];
  const producers = movie.credits?.crew?.filter(
    (c) => c.job === "Producer"
  )?.slice(0, 5) ?? [];

  const runtimeStr = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

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
                alt={movie.title}
                fill
                priority
                sizes="200px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col justify-end gap-3">
            <h1 className="text-3xl font-bold sm:text-4xl">
              {movie.title}
              {year && (
                <span className="ml-3 text-xl font-normal text-muted">
                  ({year})
                </span>
              )}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
              {movie.genres?.map((g) => (
                <span key={g.id} className="rounded-full bg-surface px-3 py-1">
                  {g.name}
                </span>
              ))}
              {runtimeStr && <span>{runtimeStr}</span>}
            </div>

            <div className="flex items-center gap-3">
              {movie.vote_average > 0 && (
                <RatingBadge rating={movie.vote_average} label="TMDB" />
              )}
              <IMDbRating imdbId={movie.imdb_id} />
            </div>

            {movie.tagline && (
              <p className="italic text-muted">{movie.tagline}</p>
            )}

            {movie.overview && (
              <p className="max-w-2xl text-sm leading-relaxed">
                {movie.overview}
              </p>
            )}

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <WatchListButton
                tmdbId={movie.id}
                mediaType="movie"
                title={movie.title}
                posterPath={movie.poster_path}
                year={year ?? null}
                rating={movie.vote_average}
              />
              <Link
                href={`/compare?a=${movie.id}&aType=movie`}
                className="mt-2 w-fit rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Compare with...
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Crew */}
      {(directors.length > 0 || writers.length > 0 || producers.length > 0) && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Key Crew</h2>
          <div className="flex flex-wrap gap-6 text-sm">
            {directors.length > 0 && (
              <div>
                <span className="text-muted">Director{directors.length > 1 ? "s" : ""}</span>
                <div className="mt-1 flex gap-2">
                  {directors.map((d) => (
                    <Link key={d.id} href={`/person/${d.id}`} className="hover:text-accent-hover">
                      {d.name}
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
                <span className="text-muted">Producers</span>
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
        <CastSection
          cast={movie.credits?.cast ?? []}
          mediaType="movie"
          productionId={movie.id}
          filmYear={year}
        />
      </div>

      {/* Recommendations */}
      <RecommendationsSection
        items={movie.recommendations?.results ?? []}
        mediaType="movie"
      />
    </div>
  );
}
