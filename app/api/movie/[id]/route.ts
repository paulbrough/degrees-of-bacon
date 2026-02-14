import { NextRequest, NextResponse } from "next/server";
import { getMovie } from "@/lib/tmdb";
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
    const cached = await getCachedProduction(tmdbId, "movie");
    if (cached && !cached.isStale) {
      return NextResponse.json(cached.data);
    }

    if (cached?.isStale) {
      // Return stale data immediately, refresh in background
      getMovie(tmdbId).then((fresh) => cacheProduction(tmdbId, "movie", fresh)).catch(() => {});
      return NextResponse.json(cached.data);
    }

    const data = await getMovie(tmdbId);
    await cacheProduction(tmdbId, "movie", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Movie fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch movie" }, { status: 500 });
  }
}
