import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { RatingBadge } from "@/components/RatingBadge";

interface ProductionCardProps {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  year: string | null;
  rating: number;
}

export function ProductionCard({
  id,
  mediaType,
  title,
  posterPath,
  year,
  rating,
}: ProductionCardProps) {
  const href = `/${mediaType === "movie" ? "movie" : "tv"}/${id}`;
  const imgUrl = tmdbImageUrl(posterPath, "w342");

  return (
    <Link
      href={href}
      className="group block w-[180px] shrink-0"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={title}
            fill
            sizes="180px"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted text-sm">
            No Image
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="truncate text-sm font-medium group-hover:text-accent-hover">
          {title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {year && <span className="text-xs text-muted">{year}</span>}
          {rating > 0 && <RatingBadge rating={rating} />}
        </div>
      </div>
    </Link>
  );
}
