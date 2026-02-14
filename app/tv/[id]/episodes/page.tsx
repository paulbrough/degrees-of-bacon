import { notFound } from "next/navigation";
import { fetchTv, fetchTvSeasons } from "@/lib/fetch-production";
import { EpisodeList } from "@/components/EpisodeList";

export default async function TvEpisodesPage({
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

  const seasonNumbers = (show.seasons ?? [])
    .filter((s) => s.episode_count > 0)
    .map((s) => s.season_number);

  if (seasonNumbers.length === 0) notFound();

  const seasons = await fetchTvSeasons(tmdbId, seasonNumbers);

  const year = show.first_air_date?.slice(0, 4) ?? null;

  return (
    <div>
      <EpisodeList
        showTitle={show.name}
        showId={show.id}
        posterPath={show.poster_path}
        year={year}
        seasons={seasons}
      />
    </div>
  );
}
