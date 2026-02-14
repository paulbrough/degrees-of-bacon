// Client-safe — no env vars needed
export type TMDBImageSize =
  | "w92"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "original";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function tmdbImageUrl(
  path: string | null | undefined,
  size: TMDBImageSize = "w500"
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
