import { getTrending, getPopular, getRecommendationsFor } from "@/lib/tmdb";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";
import { ProductionCard } from "@/components/ProductionCard";

function MediaRow({
  title,
  items,
}: {
  title: string;
  items: { id: number; media_type?: string; title?: string; name?: string; poster_path: string | null; release_date?: string; first_air_date?: string; vote_average: number }[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.slice(0, 20).map((item) => {
          const mediaType = item.media_type === "tv" ? "tv" : "movie";
          return (
            <ProductionCard
              key={`${mediaType}-${item.id}`}
              id={item.id}
              mediaType={mediaType}
              title={item.title || item.name || ""}
              posterPath={item.poster_path}
              year={(item.release_date || item.first_air_date)?.slice(0, 4) ?? null}
              rating={item.vote_average}
            />
          );
        })}
      </div>
    </section>
  );
}

export default async function Home() {
  const [trending, popularMovies, popularTv] = await Promise.all([
    getTrending("week").catch(() => ({ results: [] })),
    getPopular("movie").catch(() => ({ results: [] })),
    getPopular("tv").catch(() => ({ results: [] })),
  ]);

  // "Because you watched" — find most recent watch list entry
  let recentRecs: typeof trending.results = [];
  let recentTitle = "";
  try {
    const userId = await getAuthUserId();
    const recent = userId ? await prisma.watchListEntry.findFirst({
      where: { userId },
      orderBy: { addedAt: "desc" },
    }) : null;
    if (recent) {
      recentTitle = recent.title;
      const recs = await getRecommendationsFor(
        recent.tmdbId,
        recent.mediaType as "movie" | "tv"
      );
      recentRecs = recs.results ?? [];
    }
  } catch {
    // Ignore — personalized section is optional
  }

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Degrees of Bacon
        </h1>
        <p className="mt-3 text-muted">
          Discover connections between your favorite movies, TV shows, and actors.
        </p>
      </div>

      {/* Trending */}
      <MediaRow
        title="Trending This Week"
        items={trending.results}
      />

      {/* Because You Watched */}
      {recentRecs.length > 0 && (
        <MediaRow
          title={`Because You Watched "${recentTitle}"`}
          items={recentRecs}
        />
      )}

      {/* Popular Movies */}
      <MediaRow
        title="Popular Movies"
        items={popularMovies.results.map((r) => ({ ...r, media_type: "movie" }))}
      />

      {/* Popular TV */}
      <MediaRow
        title="Popular TV Shows"
        items={popularTv.results.map((r) => ({ ...r, media_type: "tv" }))}
      />
    </div>
  );
}
