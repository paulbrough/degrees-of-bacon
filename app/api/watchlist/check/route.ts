import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ onWatchList: false });
  }

  const { searchParams } = request.nextUrl;
  const tmdbId = parseInt(searchParams.get("tmdbId") || "", 10);
  const mediaType = searchParams.get("mediaType") || "";

  if (isNaN(tmdbId) || !mediaType) {
    return NextResponse.json({ onWatchList: false });
  }

  const entry = await prisma.watchListEntry.findFirst({
    where: { userId, tmdbId, mediaType },
    select: { id: true },
  });

  return NextResponse.json({ onWatchList: !!entry });
}
