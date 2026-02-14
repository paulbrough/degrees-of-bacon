import { notFound } from "next/navigation";
import { fetchMovie } from "@/lib/fetch-production";
import { FullCastList } from "@/components/FullCastList";

export default async function MovieCastPage({
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

  const year = movie.release_date?.slice(0, 4) ?? null;

  return (
    <div>
      <FullCastList
        title={movie.title}
        year={year}
        posterPath={movie.poster_path}
        mediaType="movie"
        productionId={movie.id}
        cast={movie.credits?.cast ?? []}
        crew={movie.credits?.crew ?? []}
        filmYear={year}
      />
    </div>
  );
}
