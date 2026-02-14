"use client";

import { useEffect, useState } from "react";
import { RatingBadge } from "@/components/RatingBadge";

export function IMDbRating({ imdbId }: { imdbId: string | null }) {
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imdbId) return;
    setLoading(true);
    fetch(`/api/ratings/${imdbId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.imdb) setRating(data.imdb);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [imdbId]);

  if (!imdbId) return null;
  if (loading) return <span className="text-sm text-muted">IMDb...</span>;
  if (!rating) return null;

  return <RatingBadge rating={rating} label="IMDb" />;
}
