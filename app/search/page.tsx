import Link from "next/link";
import Image from "next/image";
import { searchMulti } from "@/lib/tmdb";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { RatingBadge } from "@/components/RatingBadge";
import { SearchResults } from "@/components/SearchResults";
import type {
  TMDBMultiSearchResult,
  TMDBMovieSearchResult,
  TMDBTvSearchResult,
  TMDBPersonSearchResult,
} from "@/lib/types/tmdb";

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Science Fiction", 10770: "TV Movie", 53: "Thriller", 10752: "War",
  37: "Western", 10759: "Action & Adventure", 10762: "Kids", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk",
  10768: "War & Politics",
};

function TopResultMovie({ result }: { result: TMDBMovieSearchResult }) {
  const imgUrl = tmdbImageUrl(result.poster_path, "w342");
  const year = result.release_date?.slice(0, 4);
  const genres = result.genre_ids
    ?.map((id) => GENRE_MAP[id])
    .filter(Boolean)
    .slice(0, 3);
  const overview =
    result.overview && result.overview.length > 200
      ? result.overview.slice(0, 200).trimEnd() + "..."
      : result.overview;

  return (
    <Link
      href={`/movie/${result.id}`}
      className="group flex gap-6 rounded-xl bg-surface p-5 transition-colors hover:bg-surface-hover"
    >
      <div className="relative hidden aspect-[2/3] w-[140px] shrink-0 overflow-hidden rounded-lg sm:block">
        {imgUrl ? (
          <Image src={imgUrl} alt={result.title} fill sizes="140px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-border text-muted text-sm">No Image</div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        <span className="mb-1 w-fit rounded bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
          Movie
        </span>
        <h2 className="text-xl font-bold group-hover:text-accent-hover">
          {result.title}
          {year && <span className="ml-2 text-base font-normal text-muted">({year})</span>}
        </h2>
        {genres && genres.length > 0 && (
          <p className="mt-1 text-sm text-muted">{genres.join(", ")}</p>
        )}
        <div className="mt-2 flex items-center gap-3">
          {result.vote_average > 0 && <RatingBadge rating={result.vote_average} />}
        </div>
        {overview && (
          <p className="mt-3 text-sm leading-relaxed text-muted">{overview}</p>
        )}
      </div>
    </Link>
  );
}

function TopResultTv({ result }: { result: TMDBTvSearchResult }) {
  const imgUrl = tmdbImageUrl(result.poster_path, "w342");
  const year = result.first_air_date?.slice(0, 4);
  const genres = result.genre_ids
    ?.map((id) => GENRE_MAP[id])
    .filter(Boolean)
    .slice(0, 3);
  const overview =
    result.overview && result.overview.length > 200
      ? result.overview.slice(0, 200).trimEnd() + "..."
      : result.overview;

  return (
    <Link
      href={`/tv/${result.id}`}
      className="group flex gap-6 rounded-xl bg-surface p-5 transition-colors hover:bg-surface-hover"
    >
      <div className="relative hidden aspect-[2/3] w-[140px] shrink-0 overflow-hidden rounded-lg sm:block">
        {imgUrl ? (
          <Image src={imgUrl} alt={result.name} fill sizes="140px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-border text-muted text-sm">No Image</div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        <span className="mb-1 w-fit rounded bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
          TV Show
        </span>
        <h2 className="text-xl font-bold group-hover:text-accent-hover">
          {result.name}
          {year && <span className="ml-2 text-base font-normal text-muted">({year})</span>}
        </h2>
        {genres && genres.length > 0 && (
          <p className="mt-1 text-sm text-muted">{genres.join(", ")}</p>
        )}
        <div className="mt-2 flex items-center gap-3">
          {result.vote_average > 0 && <RatingBadge rating={result.vote_average} />}
        </div>
        {overview && (
          <p className="mt-3 text-sm leading-relaxed text-muted">{overview}</p>
        )}
      </div>
    </Link>
  );
}

function TopResultPerson({ result }: { result: TMDBPersonSearchResult }) {
  const imgUrl = tmdbImageUrl(result.profile_path, "w342");
  const knownFor = result.known_for
    ?.map((k) => ("title" in k ? k.title : k.name) || "")
    .filter(Boolean)
    .slice(0, 4);

  return (
    <Link
      href={`/person/${result.id}`}
      className="group flex gap-6 rounded-xl bg-surface p-5 transition-colors hover:bg-surface-hover"
    >
      <div className="relative hidden aspect-[2/3] w-[140px] shrink-0 overflow-hidden rounded-lg sm:block">
        {imgUrl ? (
          <Image src={imgUrl} alt={result.name} fill sizes="140px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-border text-muted text-sm">?</div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        <span className="mb-1 w-fit rounded bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
          Person
        </span>
        <h2 className="text-xl font-bold group-hover:text-accent-hover">{result.name}</h2>
        <p className="mt-1 text-sm text-muted">{result.known_for_department}</p>
        {knownFor && knownFor.length > 0 && (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Known for: {knownFor.join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}

function TopResult({ result }: { result: TMDBMultiSearchResult }) {
  switch (result.media_type) {
    case "movie":
      return <TopResultMovie result={result} />;
    case "tv":
      return <TopResultTv result={result} />;
    case "person":
      return <TopResultPerson result={result} />;
  }
}

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

  const sorted = [...data.results].sort((a, b) => b.popularity - a.popularity);
  const topResult = sorted[0] ?? null;
  const rest = sorted.slice(1);

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Results for &ldquo;{q}&rdquo;
      </h1>

      {topResult && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Top Result
          </h2>
          <TopResult result={topResult} />
        </section>
      )}

      {rest.length > 0 && (
        <section className="mt-8">
          <SearchResults results={rest} />
        </section>
      )}

      {data.results.length === 0 && (
        <p className="mt-8 text-muted">No results found.</p>
      )}
    </div>
  );
}
