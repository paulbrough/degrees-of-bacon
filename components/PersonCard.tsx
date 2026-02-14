import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";

interface PersonCardProps {
  id: number;
  name: string;
  profilePath: string | null;
  knownForDepartment: string;
  knownFor?: string[];
}

export function PersonCard({
  id,
  name,
  profilePath,
  knownForDepartment,
  knownFor,
}: PersonCardProps) {
  const imgUrl = tmdbImageUrl(profilePath, "w185");

  return (
    <Link
      href={`/person/${id}`}
      className="group flex items-center gap-3 rounded-lg bg-surface p-3 transition-colors hover:bg-surface-hover"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-border">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted text-xs">
            ?
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium group-hover:text-accent-hover">{name}</p>
        <p className="text-sm text-muted">{knownForDepartment}</p>
        {knownFor && knownFor.length > 0 && (
          <p className="truncate text-xs text-muted">
            {knownFor.slice(0, 3).join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}
