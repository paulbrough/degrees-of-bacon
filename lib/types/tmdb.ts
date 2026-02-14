// TMDB API response types

export interface TMDBSearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  popularity: number;
}

export interface TMDBMovieSearchResult extends TMDBSearchResult {
  media_type: "movie";
  title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface TMDBTvSearchResult extends TMDBSearchResult {
  media_type: "tv";
  name: string;
  first_air_date: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface TMDBPersonSearchResult extends TMDBSearchResult {
  media_type: "person";
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: (TMDBMovieSearchResult | TMDBTvSearchResult)[];
}

export type TMDBMultiSearchResult =
  | TMDBMovieSearchResult
  | TMDBTvSearchResult
  | TMDBPersonSearchResult;

export interface TMDBSearchMultiResponse {
  page: number;
  results: TMDBMultiSearchResult[];
  total_pages: number;
  total_results: number;
}

// Genre
export interface TMDBGenre {
  id: number;
  name: string;
}

// Credits
export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department: string;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

// Images
export interface TMDBImage {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  vote_average: number;
}

export interface TMDBImages {
  backdrops: TMDBImage[];
  posters: TMDBImage[];
  logos: TMDBImage[];
}

// Movie Detail
export interface TMDBMovieDetail {
  id: number;
  imdb_id: string | null;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  runtime: number | null;
  genres: TMDBGenre[];
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  credits: TMDBCredits;
  images: TMDBImages;
  recommendations: { results: TMDBMovieSearchResult[] };
  similar: { results: TMDBMovieSearchResult[] };
}

// TV Detail
export interface TMDBNetwork {
  id: number;
  name: string;
  logo_path: string | null;
}

export interface TMDBCreatedBy {
  id: number;
  name: string;
  profile_path: string | null;
}

export interface TMDBTvDetail {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string;
  last_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  genres: TMDBGenre[];
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  tagline: string;
  status: string;
  created_by: TMDBCreatedBy[];
  networks: TMDBNetwork[];
  credits: TMDBCredits;
  images: TMDBImages;
  recommendations: { results: TMDBTvSearchResult[] };
  similar: { results: TMDBTvSearchResult[] };
  external_ids?: { imdb_id: string | null };
}

// Person Detail
export interface TMDBPersonCreditAsCast {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  character: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  vote_average: number;
  popularity: number;
  genre_ids: number[];
  episode_count?: number;
}

export interface TMDBPersonCreditAsCrew {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  job: string;
  department: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  vote_average: number;
  popularity: number;
  genre_ids: number[];
}

export interface TMDBCombinedCredits {
  cast: TMDBPersonCreditAsCast[];
  crew: TMDBPersonCreditAsCrew[];
}

export interface TMDBTaggedImage extends TMDBImage {
  media_type: "movie" | "tv";
  media: { id: number; title?: string; name?: string };
}

export interface TMDBPersonDetail {
  id: number;
  imdb_id: string | null;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  also_known_as: string[];
  combined_credits: TMDBCombinedCredits;
  images: { profiles: TMDBImage[] };
  tagged_images: { results: TMDBTaggedImage[] };
}

// Trending
export interface TMDBTrendingResponse {
  page: number;
  results: (TMDBMovieSearchResult | TMDBTvSearchResult)[];
  total_pages: number;
  total_results: number;
}
