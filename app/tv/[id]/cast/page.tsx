import { notFound } from "next/navigation";
import { fetchTv } from "@/lib/fetch-production";
import { FullCastList } from "@/components/FullCastList";

export default async function TvCastPage({
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
  } catch {
    notFound();
  }

  const startYear = show.first_air_date?.slice(0, 4) ?? null;
  const isEnded = show.status === "Ended" || show.status === "Canceled";
  const endYear = isEnded
    ? (show.last_air_date?.slice(0, 4) ?? startYear)
    : new Date().getFullYear().toString();

  return (
    <div>
      <FullCastList
        title={show.name}
        year={startYear}
        posterPath={show.poster_path}
        mediaType="tv"
        productionId={show.id}
        cast={show.credits?.cast ?? []}
        crew={show.credits?.crew ?? []}
        aggregateCast={show.aggregate_credits?.cast}
        aggregateCrew={show.aggregate_credits?.crew}
        filmYear={startYear}
        filmEndYear={endYear}
      />
    </div>
  );
}
