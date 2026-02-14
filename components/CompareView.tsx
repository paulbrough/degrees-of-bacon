"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { ProductionPicker } from "@/components/ProductionPicker";

interface PickedProduction {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  year: string | null;
}

interface SharedPerson {
  id: number;
  name: string;
  profilePath: string | null;
  roleInA: string;
  roleInB: string;
}

interface CompareResult {
  productionA: PickedProduction;
  productionB: PickedProduction;
  shared: {
    acting: SharedPerson[];
    directing: SharedPerson[];
    writing: SharedPerson[];
    production: SharedPerson[];
    other: SharedPerson[];
  };
  totalShared: number;
}

interface CompareViewProps {
  initialA?: PickedProduction | null;
  initialB?: PickedProduction | null;
}

export function CompareView({ initialA = null, initialB = null }: CompareViewProps) {
  const [prodA, setProdA] = useState<PickedProduction | null>(initialA);
  const [prodB, setProdB] = useState<PickedProduction | null>(initialB);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prodA || !prodB) {
      setResult(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      a: String(prodA.id),
      aType: prodA.mediaType,
      b: String(prodB.id),
      bType: prodB.mediaType,
    });

    fetch(`/api/compare?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to compare");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [prodA, prodB]);

  const groups = result
    ? [
        { label: "Actors", items: result.shared.acting },
        { label: "Directors", items: result.shared.directing },
        { label: "Writers", items: result.shared.writing },
        { label: "Producers", items: result.shared.production },
        { label: "Other Crew", items: result.shared.other },
      ].filter((g) => g.items.length > 0)
    : [];

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2">
        <ProductionPicker
          label="Production A"
          selected={prodA}
          onSelect={setProdA}
          onClear={() => setProdA(null)}
        />
        <ProductionPicker
          label="Production B"
          selected={prodB}
          onSelect={setProdB}
          onClear={() => setProdB(null)}
        />
      </div>

      {loading && (
        <p className="mt-8 text-center text-sm text-muted">Comparing...</p>
      )}

      {error && (
        <p className="mt-8 text-center text-sm text-red-400">{error}</p>
      )}

      {result && !loading && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">
            {result.totalShared} shared {result.totalShared === 1 ? "person" : "people"}
          </h2>

          {result.totalShared === 0 && (
            <p className="text-sm text-muted">No people in common between these two productions.</p>
          )}

          {groups.map((group) => (
            <section key={group.label} className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-muted">{group.label}</h3>
              <div className="space-y-1">
                {group.items.map((person) => {
                  const imgUrl = tmdbImageUrl(person.profilePath, "w92");
                  return (
                    <Link
                      key={person.id}
                      href={`/person/${person.id}`}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-hover"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={person.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted">?</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{person.name}</p>
                        <div className="flex flex-col gap-0.5 text-xs text-muted sm:flex-row sm:gap-4">
                          <span className="truncate">{result.productionA.title}: {person.roleInA}</span>
                          <span className="truncate">{result.productionB.title}: {person.roleInB}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
