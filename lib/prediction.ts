import type { TMDBPersonCreditAsCast } from "@/lib/types/tmdb";

interface WatchListItem {
  tmdbId: number;
  mediaType: string;
}

interface CachedGenreData {
  tmdbId: number;
  mediaType: string;
  genres: number[];
  year: string | null;
}

export interface PredictionEntry {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  character: string;
  posterPath: string | null;
  year: string | null;
  score: number;
  taggedImagePath?: string | null;
}

export interface PredictionResult {
  confirmed: PredictionEntry[];
  likely: PredictionEntry[];
  possible: PredictionEntry[];
  watchListSize: number;
}

const LIKELY_THRESHOLD = 0.6;
const POSSIBLE_THRESHOLD = 0.3;

export function predictKnownFrom(
  castCredits: TMDBPersonCreditAsCast[],
  watchList: WatchListItem[],
  genreData: CachedGenreData[],
  taggedImages?: { media_id: number; file_path: string }[]
): PredictionResult {
  const watchSet = new Set(watchList.map((w) => `${w.mediaType}-${w.tmdbId}`));

  // Build genre frequency from watch list
  const genreFreq = new Map<number, number>();
  const watchedYears: number[] = [];

  for (const item of genreData) {
    for (const g of item.genres) {
      genreFreq.set(g, (genreFreq.get(g) || 0) + 1);
    }
    if (item.year) {
      const y = parseInt(item.year, 10);
      if (!isNaN(y)) watchedYears.push(y);
    }
  }

  const totalGenreEntries = [...genreFreq.values()].reduce((a, b) => a + b, 0) || 1;
  const medianYear = watchedYears.length > 0
    ? watchedYears.sort((a, b) => a - b)[Math.floor(watchedYears.length / 2)]
    : 2020;

  // Build tagged image map
  const taggedMap = new Map<number, string>();
  if (taggedImages) {
    for (const img of taggedImages) {
      if (!taggedMap.has(img.media_id)) {
        taggedMap.set(img.media_id, img.file_path);
      }
    }
  }

  // Deduplicate credits by tmdbId + mediaType
  const seen = new Set<string>();
  const uniqueCredits = castCredits.filter((c) => {
    const key = `${c.media_type}-${c.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const confirmed: PredictionEntry[] = [];
  const scored: (PredictionEntry & { score: number })[] = [];

  for (const credit of uniqueCredits) {
    const key = `${credit.media_type}-${credit.id}`;
    const title = credit.title || credit.name || "Untitled";
    const date = credit.release_date || credit.first_air_date;
    const year = date?.slice(0, 4) ?? null;

    const entry: PredictionEntry = {
      id: credit.id,
      mediaType: credit.media_type,
      title,
      character: credit.character || "",
      posterPath: credit.poster_path,
      year,
      score: 0,
      taggedImagePath: taggedMap.get(credit.id) ?? null,
    };

    if (watchSet.has(key)) {
      entry.score = 1;
      confirmed.push(entry);
      continue;
    }

    // Score: popularity (0.5) + genre overlap (0.3) + era match (0.2)
    const popScore = Math.min((credit.popularity || 0) / 100, 1);

    let genreOverlap = 0;
    if (credit.genre_ids && credit.genre_ids.length > 0) {
      const matchingGenres = credit.genre_ids.filter((g) => genreFreq.has(g)).length;
      genreOverlap = matchingGenres / credit.genre_ids.length;
    }

    let eraScore = 0;
    if (year) {
      const y = parseInt(year, 10);
      if (!isNaN(y)) {
        const diff = y - medianYear;
        eraScore = Math.exp(-0.5 * Math.pow(diff / 5, 2));
      }
    }

    entry.score = 0.5 * popScore + 0.3 * genreOverlap + 0.2 * eraScore;
    scored.push(entry);
  }

  // Sort scored by score descending
  scored.sort((a, b) => b.score - a.score);

  const likely = scored.filter((e) => e.score >= LIKELY_THRESHOLD);
  const possible = scored.filter((e) => e.score >= POSSIBLE_THRESHOLD && e.score < LIKELY_THRESHOLD);

  return {
    confirmed,
    likely,
    possible,
    watchListSize: watchList.length,
  };
}
