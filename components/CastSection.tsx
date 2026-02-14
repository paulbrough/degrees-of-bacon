import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import type { TMDBCastMember } from "@/lib/types/tmdb";

export function CastSection({ cast }: { cast: TMDBCastMember[] }) {
  if (!cast || cast.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Cast</h2>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {cast.slice(0, 20).map((member) => {
          const imgUrl = tmdbImageUrl(member.profile_path, "w185");
          return (
            <Link
              key={`${member.id}-${member.character}`}
              href={`/person/${member.id}`}
              className="group w-[120px] shrink-0"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={member.name}
                    fill
                    sizes="120px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted text-sm">
                    ?
                  </div>
                )}
              </div>
              <p className="mt-1.5 truncate text-sm font-medium group-hover:text-accent-hover">
                {member.name}
              </p>
              <p className="truncate text-xs text-muted">{member.character}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
