import { ProductionCard } from "@/components/ProductionCard";

interface Recommendation {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

export function RecommendationsSection({
  items,
  mediaType,
}: {
  items: Recommendation[];
  mediaType: "movie" | "tv";
}) {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Recommendations</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.slice(0, 12).map((item) => (
          <ProductionCard
            key={item.id}
            id={item.id}
            mediaType={mediaType}
            title={item.title || item.name || ""}
            posterPath={item.poster_path}
            year={(item.release_date || item.first_air_date)?.slice(0, 4) ?? null}
            rating={item.vote_average}
          />
        ))}
      </div>
    </section>
  );
}
