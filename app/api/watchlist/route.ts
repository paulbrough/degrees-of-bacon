import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId, ensurePrismaUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const sort = searchParams.get("sort") || "addedAt";
  const order = searchParams.get("order") || "desc";
  const filter = searchParams.get("filter") || "all";
  const q = searchParams.get("q") || "";

  const where: Record<string, unknown> = { userId };
  if (filter === "movie" || filter === "tv") {
    where.mediaType = filter;
  }
  if (q.trim()) {
    where.title = { contains: q.trim(), mode: "insensitive" };
  }

  const orderByField =
    sort === "title" ? "title" :
    sort === "year" ? "year" :
    sort === "rating" ? "rating" :
    "addedAt";

  const entries = await prisma.watchListEntry.findMany({
    where,
    orderBy: { [orderByField]: order === "asc" ? "asc" : "desc" },
  });

  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tmdbId, mediaType, title, posterPath, year, rating } = body;

    if (!tmdbId || !mediaType || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure Prisma user exists
    await ensurePrismaUser(userId, "");

    const entry = await prisma.watchListEntry.create({
      data: {
        userId,
        tmdbId,
        mediaType,
        title,
        posterPath: posterPath ?? null,
        year: year ?? null,
        rating: rating ?? null,
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique") || msg.includes("Unique") || msg.includes("P2002")) {
      return NextResponse.json({ error: "Already on watch list" }, { status: 409 });
    }
    console.error("Watchlist POST error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tmdbId, mediaType } = body;

  if (!tmdbId || !mediaType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await prisma.watchListEntry.deleteMany({
    where: { userId, tmdbId, mediaType },
  });

  return NextResponse.json({ success: true });
}
