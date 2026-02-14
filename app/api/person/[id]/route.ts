import { NextRequest, NextResponse } from "next/server";
import { fetchPerson } from "@/lib/fetch-production";

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
    const data = await fetchPerson(tmdbId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Person fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch person" }, { status: 500 });
  }
}
