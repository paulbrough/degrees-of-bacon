import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchPerson } from "@/lib/fetch-production";
import { predictKnownFrom } from "@/lib/prediction";
import { getAuthUserId } from "@/lib/auth";
import type { TMDBMovieDetail, TMDBTvDetail } from "@/lib/types/tmdb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  const tmdbId = parseInt(personId, 10);
  if (isNaN(tmdbId)) {
    return NextResponse.json({ error: "Invalid person ID" }, { status: 400 });
  }

  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch person data (cached)
    const person = await fetchPerson(tmdbId);
    const castCredits = person.combined_credits?.cast ?? [];

    // Get user's seen list
    const seenList = await prisma.seenItEntry.findMany({
      where: { userId },
      select: { tmdbId: true, mediaType: true },
    });

    // Get genre data for seen titles from cache
    const seenTmdbIds = seenList.map((w) => w.tmdbId);
    const cachedProductions = seenTmdbIds.length > 0
      ? await prisma.cachedProduction.findMany({
          where: { tmdbId: { in: seenTmdbIds } },
          select: { tmdbId: true, mediaType: true, data: true },
        })
      : [];

    const genreData = cachedProductions.map((cp) => {
      const data = cp.data as unknown as TMDBMovieDetail | TMDBTvDetail;
      const genres = (data.genres ?? []).map((g) => g.id);
      const date = "release_date" in data ? data.release_date : data.first_air_date;
      return {
        tmdbId: cp.tmdbId,
        mediaType: cp.mediaType,
        genres,
        year: date?.slice(0, 4) ?? null,
      };
    });

    // Build tagged images lookup
    const taggedImages = (person.tagged_images?.results ?? []).map((img) => ({
      media_id: img.media?.id ?? 0,
      file_path: img.file_path,
    }));

    const result = predictKnownFrom(castCredits, seenList, genreData, taggedImages);

    return NextResponse.json(result);
  } catch (e) {
    console.error("Prediction error:", e);
    return NextResponse.json({ error: "Failed to generate predictions" }, { status: 500 });
  }
}
