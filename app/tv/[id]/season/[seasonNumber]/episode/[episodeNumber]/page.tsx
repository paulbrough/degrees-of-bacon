import { notFound } from "next/navigation";
import { fetchTv, fetchTvEpisode } from "@/lib/fetch-production";
import { EpisodeDetail } from "@/components/EpisodeDetail";

interface EpisodeNav {
  seasonNumber: number;
  episodeNumber: number;
  label: string;
}

function computeNav(
  show: { seasons?: { season_number: number; episode_count: number }[] },
  seasonNumber: number,
  episodeNumber: number
): { prev: EpisodeNav | null; next: EpisodeNav | null } {
  // Build ordered list of real seasons (episode_count > 0, exclude specials)
  const seasons = (show.seasons ?? [])
    .filter((s) => s.season_number > 0 && s.episode_count > 0)
    .sort((a, b) => a.season_number - b.season_number);

  const seasonIdx = seasons.findIndex((s) => s.season_number === seasonNumber);

  let prev: EpisodeNav | null = null;
  let next: EpisodeNav | null = null;

  // Previous episode
  if (episodeNumber > 1) {
    const ep = episodeNumber - 1;
    prev = {
      seasonNumber,
      episodeNumber: ep,
      label: `S${String(seasonNumber).padStart(2, "0")}E${String(ep).padStart(2, "0")}`,
    };
  } else if (seasonIdx > 0) {
    const prevSeason = seasons[seasonIdx - 1];
    const ep = prevSeason.episode_count;
    prev = {
      seasonNumber: prevSeason.season_number,
      episodeNumber: ep,
      label: `S${String(prevSeason.season_number).padStart(2, "0")}E${String(ep).padStart(2, "0")}`,
    };
  }

  // Next episode
  const currentSeason = seasons[seasonIdx];
  if (currentSeason && episodeNumber < currentSeason.episode_count) {
    const ep = episodeNumber + 1;
    next = {
      seasonNumber,
      episodeNumber: ep,
      label: `S${String(seasonNumber).padStart(2, "0")}E${String(ep).padStart(2, "0")}`,
    };
  } else if (seasonIdx >= 0 && seasonIdx < seasons.length - 1) {
    const nextSeason = seasons[seasonIdx + 1];
    next = {
      seasonNumber: nextSeason.season_number,
      episodeNumber: 1,
      label: `S${String(nextSeason.season_number).padStart(2, "0")}E01`,
    };
  }

  return { prev, next };
}

export default async function EpisodePage({
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
  } catch (error) {
    console.error("Episode fetch error", { tvId, seasonNumber, episodeNumber }, error);
    notFound();
  }

  const { prev, next } = computeNav(show, seasonNumber, episodeNumber);

  return (
    <EpisodeDetail
      episode={episode}
      show={show}
      prev={prev}
      next={next}
    />
  );
}
