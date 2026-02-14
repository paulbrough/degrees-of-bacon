import { NextResponse } from "next/server";
import { getTrending } from "@/lib/tmdb";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const data = await getTrending("week");
    return NextResponse.json(data);
  } catch (e) {
    console.error("Trending error:", e);
    return NextResponse.json({ error: "Failed to fetch trending" }, { status: 500 });
  }
}
