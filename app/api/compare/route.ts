import { NextRequest, NextResponse } from "next/server";
import { fetchMovie, fetchTv } from "@/lib/fetch-production";

interface SharedPerson {
  id: number;
  name: string;
  profilePath: string | null;
  roleInA: string;
  roleInB: string;
}

interface GroupedShared {
  acting: SharedPerson[];
  directing: SharedPerson[];
  writing: SharedPerson[];
  production: SharedPerson[];
  other: SharedPerson[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const aId = parseInt(searchParams.get("a") || "", 10);
  const aType = searchParams.get("aType") as "movie" | "tv" | null;
  const bId = parseInt(searchParams.get("b") || "", 10);
  const bType = searchParams.get("bType") as "movie" | "tv" | null;

  if (isNaN(aId) || isNaN(bId) || !aType || !bType) {
    return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
  }

  try {
    const [prodA, prodB] = await Promise.all([
      aType === "movie" ? fetchMovie(aId) : fetchTv(aId),
      bType === "movie" ? fetchMovie(bId) : fetchTv(bId),
    ]);

    const titleA = "title" in prodA ? prodA.title : prodA.name;
    const titleB = "title" in prodB ? prodB.title : prodB.name;
    const yearA = "release_date" in prodA ? prodA.release_date?.slice(0, 4) : prodA.first_air_date?.slice(0, 4);
    const yearB = "release_date" in prodB ? prodB.release_date?.slice(0, 4) : prodB.first_air_date?.slice(0, 4);

    // Build maps of person → roles for both productions
    type RoleInfo = { name: string; profilePath: string | null; roles: Map<string, string> };

    function buildPersonMap(prod: Record<string, unknown>): Map<number, RoleInfo> {
      const map = new Map<number, RoleInfo>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = prod as any;

      // Use aggregate_credits for TV shows (more complete cast), fall back to regular credits
      const useAggregate = !!p.aggregate_credits;
      const castList = useAggregate ? (p.aggregate_credits?.cast ?? []) : (p.credits?.cast ?? []);
      const crewList = useAggregate ? (p.aggregate_credits?.crew ?? []) : (p.credits?.crew ?? []);

      for (const cast of castList) {
        const character = useAggregate
          ? (cast.roles?.map((r: { character: string }) => r.character).filter(Boolean).join(" / ") || "Actor")
          : (cast.character || "Actor");
        const existing = map.get(cast.id);
        if (existing) {
          existing.roles.set("Acting", character);
        } else {
          map.set(cast.id, {
            name: cast.name,
            profilePath: cast.profile_path,
            roles: new Map([["Acting", character]]),
          });
        }
      }

      for (const crew of crewList) {
        const department = useAggregate ? (crew.department || "Other") : crew.department;
        const job = useAggregate
          ? (crew.jobs?.map((j: { job: string }) => j.job).filter(Boolean).join(" / ") || department)
          : crew.job;
        const existing = map.get(crew.id);
        if (existing) {
          existing.roles.set(department, job);
        } else {
          map.set(crew.id, {
            name: crew.name,
            profilePath: crew.profile_path,
            roles: new Map([[department, job]]),
          });
        }
      }

      return map;
    }

    const mapA = buildPersonMap(prodA as unknown as Record<string, unknown>);
    const mapB = buildPersonMap(prodB as unknown as Record<string, unknown>);

    // Find shared people
    const shared: GroupedShared = { acting: [], directing: [], writing: [], production: [], other: [] };
    const seenIds = new Set<number>();

    for (const [personId, infoA] of mapA) {
      const infoB = mapB.get(personId);
      if (!infoB || seenIds.has(personId)) continue;
      seenIds.add(personId);

      // Determine primary department
      const allDepts = new Set([...infoA.roles.keys(), ...infoB.roles.keys()]);
      const roleInA = [...infoA.roles.values()].join(", ");
      const roleInB = [...infoB.roles.values()].join(", ");

      const person: SharedPerson = {
        id: personId,
        name: infoA.name,
        profilePath: infoA.profilePath || infoB.profilePath,
        roleInA,
        roleInB,
      };

      if (allDepts.has("Acting")) {
        shared.acting.push(person);
      } else if (allDepts.has("Directing")) {
        shared.directing.push(person);
      } else if (allDepts.has("Writing")) {
        shared.writing.push(person);
      } else if (allDepts.has("Production")) {
        shared.production.push(person);
      } else {
        shared.other.push(person);
      }
    }

    const totalShared = shared.acting.length + shared.directing.length + shared.writing.length + shared.production.length + shared.other.length;

    return NextResponse.json({
      productionA: { id: aId, mediaType: aType, title: titleA, posterPath: prodA.poster_path, year: yearA },
      productionB: { id: bId, mediaType: bType, title: titleB, posterPath: prodB.poster_path, year: yearB },
      shared,
      totalShared,
    });
  } catch (e) {
    console.error("Compare error:", e);
    return NextResponse.json({ error: "Failed to compare productions" }, { status: 500 });
  }
}
