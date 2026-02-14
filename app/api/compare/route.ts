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
    const mapA = new Map<number, RoleInfo>();
    const mapB = new Map<number, RoleInfo>();

    // Process credits for production A
    for (const cast of prodA.credits?.cast ?? []) {
      const existing = mapA.get(cast.id);
      if (existing) {
        existing.roles.set("Acting", cast.character || "Actor");
      } else {
        mapA.set(cast.id, {
          name: cast.name,
          profilePath: cast.profile_path,
          roles: new Map([["Acting", cast.character || "Actor"]]),
        });
      }
    }
    for (const crew of prodA.credits?.crew ?? []) {
      const existing = mapA.get(crew.id);
      if (existing) {
        existing.roles.set(crew.department, crew.job);
      } else {
        mapA.set(crew.id, {
          name: crew.name,
          profilePath: crew.profile_path,
          roles: new Map([[crew.department, crew.job]]),
        });
      }
    }

    // Process credits for production B
    for (const cast of prodB.credits?.cast ?? []) {
      const existing = mapB.get(cast.id);
      if (existing) {
        existing.roles.set("Acting", cast.character || "Actor");
      } else {
        mapB.set(cast.id, {
          name: cast.name,
          profilePath: cast.profile_path,
          roles: new Map([["Acting", cast.character || "Actor"]]),
        });
      }
    }
    for (const crew of prodB.credits?.crew ?? []) {
      const existing = mapB.get(crew.id);
      if (existing) {
        existing.roles.set(crew.department, crew.job);
      } else {
        mapB.set(crew.id, {
          name: crew.name,
          profilePath: crew.profile_path,
          roles: new Map([[crew.department, crew.job]]),
        });
      }
    }

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
