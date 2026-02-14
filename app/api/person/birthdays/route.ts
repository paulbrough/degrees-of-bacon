import { NextRequest, NextResponse } from "next/server";
import { getCachedPerson, cachePerson } from "@/lib/cache";
import { getPerson } from "@/lib/tmdb";

const MAX_IDS = 50;
const MAX_CONCURRENT = 5;

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json({ error: "Missing ids parameter" }, { status: 400 });
  }

  const ids = idsParam
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n))
    .slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json({});
  }

  const result: Record<number, string | null> = {};

  // Check cache first for all IDs
  const uncachedIds: number[] = [];
  await Promise.all(
    ids.map(async (id) => {
      const cached = await getCachedPerson(id);
      if (cached) {
        result[id] = cached.data.birthday ?? null;
      } else {
        uncachedIds.push(id);
      }
    })
  );

  // Fetch uncached in batches with concurrency limit
  for (let i = 0; i < uncachedIds.length; i += MAX_CONCURRENT) {
    const batch = uncachedIds.slice(i, i + MAX_CONCURRENT);
    await Promise.all(
      batch.map(async (id) => {
        try {
          const data = await getPerson(id);
          await cachePerson(id, data);
          result[id] = data.birthday ?? null;
        } catch {
          result[id] = null;
        }
      })
    );
  }

  return NextResponse.json(result);
}
