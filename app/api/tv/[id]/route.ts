import { NextRequest, NextResponse } from "next/server";
import { getTv } from "@/lib/tmdb";
import { getCachedProduction, cacheProduction } from "@/lib/cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const cached = await getCachedProduction(tmdbId, "tv");
    if (cached && !cached.isStale) {
      return NextResponse.json(cached.data);
    }

    if (cached?.isStale) {
      getTv(tmdbId).then((fresh) => cacheProduction(tmdbId, "tv", fresh)).catch(() => {});
      return NextResponse.json(cached.data);
    }

    const data = await getTv(tmdbId);
    await cacheProduction(tmdbId, "tv", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("TV fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch TV show" }, { status: 500 });
  }
}
