"use client";

import { useState, useEffect } from "react";

interface CastAgesProps {
  personIds: number[];
  filmYear: string | null;
}

// This is a hidden component that pre-fetches birthday data
// for the top cast displayed in CastSection. It doesn't render
// visible UI — the ages are shown inline by CastSection only on
// the full cast page. This fetch warms the person cache for when
// users click through to the full cast page.
export function CastAges({ personIds, filmYear }: CastAgesProps) {
  const [, setDone] = useState(false);

  useEffect(() => {
    if (!filmYear || personIds.length === 0) return;

    let cancelled = false;
    fetch(`/api/person/birthdays?ids=${personIds.join(",")}`)
      .then(() => {
        if (!cancelled) setDone(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [personIds, filmYear]);

  // No visible output — this is a cache-warming prefetch
  return null;
}
