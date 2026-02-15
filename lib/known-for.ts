import {
  TMDBPersonCreditAsCast,
  TMDBPersonCreditAsCrew,
} from "@/lib/types/tmdb";

export interface KnownForEntry {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  year: string | null;
  rating: number;
  character?: string;
  job?: string;
  episodeCount?: number;
  roleLabel: string; // "Main Cast", "Director", "Creator", etc.
}

interface ScoredCredit {
  credit: TMDBPersonCreditAsCast | TMDBPersonCreditAsCrew;
  score: number;
  isCast: boolean;
}

/**
 * Calculate a popularity score (0-1) based on TMDB popularity metric
 */
function calculatePopularityScore(popularity: number): number {
  return Math.min(popularity / 100, 1);
}

/**
 * Calculate a quality score (0-1) based on vote average
 */
function calculateQualityScore(voteAverage: number): number {
  return voteAverage / 10;
}

/**
 * Calculate role significance score (0-1) based on credit type and details
 */
function calculateRoleSignificanceScore(
  credit: TMDBPersonCreditAsCast | TMDBPersonCreditAsCrew,
  isCast: boolean,
  knownForDepartment: string
): number {
  if (isCast) {
    const castCredit = credit as TMDBPersonCreditAsCast;
    // For TV shows with episode count
    if (castCredit.media_type === "tv" && castCredit.episode_count) {
      if (castCredit.episode_count >= 10) return 1.0; // Main Cast (adjusted for single-season shows)
      if (castCredit.episode_count >= 5) return 0.6;
      if (castCredit.episode_count >= 2) return 0.3;
      return 0.1; // Will be filtered out
    }
    // For movies or TV without episode count, assume significant
    return 0.8;
  } else {
    const crewCredit = credit as TMDBPersonCreditAsCrew;
    const job = crewCredit.job.toLowerCase();
    const dept = crewCredit.department.toLowerCase();

    // High-significance roles
    if (
      job.includes("director") ||
      job.includes("creator") ||
      job.includes("writer") ||
      job.includes("screenplay")
    ) {
      return 1.0;
    }

    // Producer roles
    if (job.includes("producer")) {
      return 0.7;
    }

    // Check if department matches known_for_department
    if (dept === knownForDepartment.toLowerCase()) {
      return 0.8;
    }

    // Other crew roles
    return 0.4;
  }
}

/**
 * Pre-filter credits to exclude minor/unreleased work
 */
function shouldIncludeCredit(
  credit: TMDBPersonCreditAsCast | TMDBPersonCreditAsCrew,
  isCast: boolean,
  knownForDepartment: string
): boolean {
  // Exclude credits without release dates (unreleased)
  const hasReleaseDate = isCast
    ? !!(credit as TMDBPersonCreditAsCast).release_date ||
      !!(credit as TMDBPersonCreditAsCast).first_air_date
    : !!(credit as TMDBPersonCreditAsCrew).release_date ||
      !!(credit as TMDBPersonCreditAsCrew).first_air_date;

  if (!hasReleaseDate) return false;

  // For cast: exclude TV guest appearances (< 2 episodes)
  if (isCast) {
    const castCredit = credit as TMDBPersonCreditAsCast;
    if (
      castCredit.media_type === "tv" &&
      castCredit.episode_count !== undefined &&
      castCredit.episode_count < 2
    ) {
      return false;
    }
  } else {
    // For crew: if person is primarily known for acting, only include if they have a significant crew role
    const crewCredit = credit as TMDBPersonCreditAsCrew;
    if (knownForDepartment.toLowerCase() === "acting") {
      const job = crewCredit.job.toLowerCase();
      const isSignificantRole =
        job.includes("director") ||
        job.includes("creator") ||
        job.includes("writer") ||
        job.includes("producer");
      if (!isSignificantRole) return false;
    }
  }

  return true;
}

/**
 * Generate a role label for display
 */
function generateRoleLabel(
  credit: TMDBPersonCreditAsCast | TMDBPersonCreditAsCrew,
  isCast: boolean
): string {
  if (isCast) {
    const castCredit = credit as TMDBPersonCreditAsCast;
    if (castCredit.media_type === "tv" && castCredit.episode_count) {
      if (castCredit.episode_count >= 10) return "Main Cast"; // Adjusted for single-season shows
      if (castCredit.episode_count >= 5) return "Recurring Cast";
      return "Guest";
    }
    return "Cast";
  } else {
    const crewCredit = credit as TMDBPersonCreditAsCrew;
    return crewCredit.job;
  }
}

/**
 * Calculate which productions a person is known for
 * Returns top 5-8 most notable productions based on popularity, quality, and role significance
 *
 * Scoring formula: Final Score = (Popularity × 0.35) + (Quality × 0.35) + (Role Significance × 0.30)
 *
 * This balanced approach ensures cult classics and critically acclaimed work aren't overshadowed
 * by currently-trending content. Role significance is weighted higher to prioritize main cast
 * and key crew positions.
 */
export function calculateKnownFor(
  castCredits: TMDBPersonCreditAsCast[],
  crewCredits: TMDBPersonCreditAsCrew[],
  knownForDepartment: string
): KnownForEntry[] {
  const scoredCredits: ScoredCredit[] = [];

  // Score cast credits
  for (const credit of castCredits) {
    if (!shouldIncludeCredit(credit, true, knownForDepartment)) continue;

    const popularityScore = calculatePopularityScore(credit.popularity);
    const qualityScore = calculateQualityScore(credit.vote_average);
    const roleSignificanceScore = calculateRoleSignificanceScore(
      credit,
      true,
      knownForDepartment
    );

    // Rebalanced weights: Popularity (35%), Quality (35%), Role Significance (30%)
    const finalScore =
      popularityScore * 0.35 + qualityScore * 0.35 + roleSignificanceScore * 0.3;

    scoredCredits.push({ credit, score: finalScore, isCast: true });
  }

  // Score crew credits
  for (const credit of crewCredits) {
    if (!shouldIncludeCredit(credit, false, knownForDepartment)) continue;

    const popularityScore = calculatePopularityScore(credit.popularity);
    const qualityScore = calculateQualityScore(credit.vote_average);
    const roleSignificanceScore = calculateRoleSignificanceScore(
      credit,
      false,
      knownForDepartment
    );

    // Rebalanced weights: Popularity (35%), Quality (35%), Role Significance (30%)
    const finalScore =
      popularityScore * 0.35 + qualityScore * 0.35 + roleSignificanceScore * 0.3;

    scoredCredits.push({ credit, score: finalScore, isCast: false });
  }

  // Sort by score descending
  scoredCredits.sort((a, b) => b.score - a.score);

  // Deduplicate by production ID + media type (keep highest scoring entry)
  const seen = new Set<string>();
  const deduplicatedCredits: ScoredCredit[] = [];

  for (const scoredCredit of scoredCredits) {
    const key = `${scoredCredit.credit.media_type}-${scoredCredit.credit.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicatedCredits.push(scoredCredit);
    }
  }

  // Take top 8, but ensure minimum score of 0.3
  const topCredits = deduplicatedCredits.slice(0, 8).filter((sc) => sc.score >= 0.3);

  // If we have very few credits meeting the threshold, relax it and take top 3-5
  if (topCredits.length < 3 && deduplicatedCredits.length > 0) {
    const fallbackCount = Math.min(5, deduplicatedCredits.length);
    topCredits.length = 0;
    topCredits.push(...deduplicatedCredits.slice(0, fallbackCount));
  }

  // Convert to KnownForEntry format
  return topCredits.map(({ credit, isCast }) => {
    const title = isCast
      ? (credit as TMDBPersonCreditAsCast).title ||
        (credit as TMDBPersonCreditAsCast).name ||
        "Unknown"
      : (credit as TMDBPersonCreditAsCrew).title ||
        (credit as TMDBPersonCreditAsCrew).name ||
        "Unknown";

    const releaseDate = isCast
      ? (credit as TMDBPersonCreditAsCast).release_date ||
        (credit as TMDBPersonCreditAsCast).first_air_date
      : (credit as TMDBPersonCreditAsCrew).release_date ||
        (credit as TMDBPersonCreditAsCrew).first_air_date;

    const year = releaseDate ? releaseDate.split("-")[0] : null;

    const entry: KnownForEntry = {
      id: credit.id,
      mediaType: credit.media_type,
      title,
      posterPath: credit.poster_path,
      year,
      rating: credit.vote_average,
      roleLabel: generateRoleLabel(credit, isCast),
    };

    if (isCast) {
      entry.character = (credit as TMDBPersonCreditAsCast).character;
      entry.episodeCount = (credit as TMDBPersonCreditAsCast).episode_count;
    } else {
      entry.job = (credit as TMDBPersonCreditAsCrew).job;
    }

    return entry;
  });
}
