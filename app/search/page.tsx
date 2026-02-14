import { searchMulti } from "@/lib/tmdb";
import { ProductionCard } from "@/components/ProductionCard";
import { PersonCard } from "@/components/PersonCard";
import type {
  TMDBMovieSearchResult,
  TMDBTvSearchResult,
  TMDBPersonSearchResult,
} from "@/lib/types/tmdb";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  if (!q || q.trim().length < 2) {
    return (
      <div className="py-12 text-center text-muted">
        Enter a search term to find movies, TV shows, and people.
      </div>
    );
  }

  const data = await searchMulti(q.trim());

  const movies = data.results.filter(
    (r): r is TMDBMovieSearchResult => r.media_type === "movie"
  );
  const tvShows = data.results.filter(
    (r): r is TMDBTvSearchResult => r.media_type === "tv"
  );
  const people = data.results.filter(
    (r): r is TMDBPersonSearchResult => r.media_type === "person"
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Results for &ldquo;{q}&rdquo;
      </h1>

      {movies.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-muted">Movies</h2>
          <div className="flex flex-wrap gap-4">
            {movies.map((m) => (
              <ProductionCard
                key={m.id}
                id={m.id}
                mediaType="movie"
                title={m.title}
                posterPath={m.poster_path}
                year={m.release_date?.slice(0, 4) ?? null}
                rating={m.vote_average}
              />
            ))}
          </div>
        </section>
      )}

      {tvShows.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-muted">TV Shows</h2>
          <div className="flex flex-wrap gap-4">
            {tvShows.map((t) => (
              <ProductionCard
                key={t.id}
                id={t.id}
                mediaType="tv"
                title={t.name}
                posterPath={t.poster_path}
                year={t.first_air_date?.slice(0, 4) ?? null}
                rating={t.vote_average}
              />
            ))}
          </div>
        </section>
      )}

      {people.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-muted">People</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p) => (
              <PersonCard
                key={p.id}
                id={p.id}
                name={p.name}
                profilePath={p.profile_path}
                knownForDepartment={p.known_for_department}
                knownFor={p.known_for?.map(
                  (k) => ("title" in k ? k.title : k.name) || ""
                )}
              />
            ))}
          </div>
        </section>
      )}

      {movies.length === 0 && tvShows.length === 0 && people.length === 0 && (
        <p className="mt-8 text-muted">No results found.</p>
      )}
    </div>
  );
}
