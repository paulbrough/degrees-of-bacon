import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { RatingBadge } from "@/components/RatingBadge";
import { calculateKnownFor, KnownForEntry } from "@/lib/known-for";
import {
  TMDBPersonCreditAsCast,
  TMDBPersonCreditAsCrew,
} from "@/lib/types/tmdb";

interface KnownForProps {
  castCredits: TMDBPersonCreditAsCast[];
  crewCredits: TMDBPersonCreditAsCrew[];
  knownForDepartment: string;
}

function KnownForCard({ entry }: { entry: KnownForEntry }) {
  const href = `/${entry.mediaType === "movie" ? "movie" : "tv"}/${entry.id}`;
  const imgUrl = tmdbImageUrl(entry.posterPath, "w342");

  return (
    <Link href={href} className="group block w-[180px] shrink-0">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={entry.title}
            fill
            sizes="180px"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted text-sm">
            No Image
          </div>
        )}
        {/* Role badge overlay */}
        <div className="absolute top-2 right-2">
          <span className="rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
            {entry.roleLabel}
          </span>
        </div>
      </div>
      <div className="mt-2">
        <p className="truncate text-sm font-medium group-hover:text-accent-hover">
          {entry.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {entry.year && <span className="text-xs text-muted">{entry.year}</span>}
          {entry.rating > 0 && <RatingBadge rating={entry.rating} />}
        </div>
        {/* Character or job detail */}
        {(entry.character || entry.job) && (
          <p className="mt-1 truncate text-xs text-muted">
            {entry.character || entry.job}
          </p>
        )}
      </div>
    </Link>
  );
}

export function KnownFor({
  castCredits,
  crewCredits,
  knownForDepartment,
}: KnownForProps) {
  const knownForEntries = calculateKnownFor(
    castCredits,
    crewCredits,
    knownForDepartment
  );

  // Don't render if no entries
  if (knownForEntries.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-bold">Known For</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {knownForEntries.map((entry) => (
          <KnownForCard key={`${entry.mediaType}-${entry.id}`} entry={entry} />
        ))}
      </div>
    </div>
  );
}
