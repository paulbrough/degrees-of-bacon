import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import type { TMDBCastMember } from "@/lib/types/tmdb";
import { CastAges } from "@/components/CastAges";

interface CastSectionProps {
  cast: TMDBCastMember[];
  mediaType: "movie" | "tv";
  productionId: number;
  episodeCounts?: Record<number, number>;
  filmYear?: string | null;
}

export function CastSection({
  cast,
  mediaType,
  productionId,
  episodeCounts,
  filmYear,
}: CastSectionProps) {
  if (!cast || cast.length === 0) return null;

  const top = cast.slice(0, 10);
  const personIds = top.map((m) => m.id);

  return (
    <section>
      <Link
        href={`/${mediaType}/${productionId}/cast`}
        className="group mb-4 flex items-center gap-2 text-lg font-semibold hover:text-accent-hover"
      >
        Top Cast
        <span className="text-muted transition-transform group-hover:translate-x-0.5">
          &rarr;
        </span>
      </Link>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {top.map((member) => {
          const imgUrl = tmdbImageUrl(member.profile_path, "w185");
          const epCount = episodeCounts?.[member.id];
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
              {epCount != null && (
                <p className="text-xs text-muted">{epCount} episode{epCount !== 1 ? "s" : ""}</p>
              )}
            </Link>
          );
        })}
      </div>
      <CastAges personIds={personIds} filmYear={filmYear ?? null} />
    </section>
  );
}
