import { NextRequest, NextResponse } from "next/server";
import { getRatings } from "@/lib/omdb";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ imdbId: string }> }
) {
  const { imdbId } = await params;

  if (!imdbId || !imdbId.startsWith("tt")) {
    return NextResponse.json({ error: "Invalid IMDB ID" }, { status: 400 });
  }

  try {
    const ratings = await getRatings(imdbId);
    return NextResponse.json(ratings);
  } catch (error) {
    console.error("Ratings fetch error:", error);
    return NextResponse.json({ imdb: null, rottenTomatoes: null, metacritic: null });
  }
}
