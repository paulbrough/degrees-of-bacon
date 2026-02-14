import { notFound } from "next/navigation";
import { fetchTv, fetchTvEpisode } from "@/lib/fetch-production";
import { FullCastList } from "@/components/FullCastList";

export default async function EpisodeCastPage({
  params,
}: {
  params: Promise<{ id: string; seasonNumber: string; episodeNumber: string }>;
}) {
  const { id, seasonNumber: snStr, episodeNumber: enStr } = await params;
  const tvId = parseInt(id, 10);
  const seasonNumber = parseInt(snStr, 10);
  const episodeNumber = parseInt(enStr, 10);

  if (isNaN(tvId) || isNaN(seasonNumber) || isNaN(episodeNumber)) notFound();

  let show;
  let episode;
  try {
    [show, episode] = await Promise.all([
      fetchTv(tvId),
      fetchTvEpisode(tvId, seasonNumber, episodeNumber),
    ]);
  } catch {
    notFound();
  }

  const snPad = String(seasonNumber).padStart(2, "0");
  const enPad = String(episodeNumber).padStart(2, "0");
  const epLabel = `S${snPad}E${enPad}`;
  const titleStr = episode.name ? `${epLabel} \u00b7 ${episode.name}` : epLabel;
  const airYear = episode.air_date?.slice(0, 4) ?? null;

  return (
    <div>
      <FullCastList
        title={titleStr}
        year={airYear}
        posterPath={show.poster_path}
        mediaType="movie"
        productionId={show.id}
        cast={episode.credits?.cast ?? []}
        crew={episode.credits?.crew ?? []}
        guestStars={episode.credits?.guest_stars ?? []}
        backUrl={`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`}
        filmYear={airYear}
      />
    </div>
  );
}
