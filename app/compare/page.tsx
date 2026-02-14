import { CompareView } from "@/components/CompareView";
import { fetchMovie, fetchTv } from "@/lib/fetch-production";

interface PickedProduction {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  year: string | null;
}

async function resolveProduction(id: string | null, type: string | null): Promise<PickedProduction | null> {
  if (!id || !type) return null;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) return null;

  try {
    if (type === "movie") {
      const movie = await fetchMovie(tmdbId);
      return {
        id: tmdbId,
        mediaType: "movie",
        title: movie.title,
        posterPath: movie.poster_path,
        year: movie.release_date?.slice(0, 4) ?? null,
      };
    } else if (type === "tv") {
      const show = await fetchTv(tmdbId);
      return {
        id: tmdbId,
        mediaType: "tv",
        title: show.name,
        posterPath: show.poster_path,
        year: show.first_air_date?.slice(0, 4) ?? null,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const a = typeof params.a === "string" ? params.a : null;
  const aType = typeof params.aType === "string" ? params.aType : null;
  const b = typeof params.b === "string" ? params.b : null;
  const bType = typeof params.bType === "string" ? params.bType : null;

  const [initialA, initialB] = await Promise.all([
    resolveProduction(a, aType),
    resolveProduction(b, bType),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Compare Productions</h1>
      <CompareView initialA={initialA} initialB={initialB} />
    </div>
  );
}
