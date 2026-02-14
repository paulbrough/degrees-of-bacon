import Image from "next/image";
import { notFound } from "next/navigation";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { fetchPerson } from "@/lib/fetch-production";
import { Filmography } from "@/components/Filmography";

function calculateAge(birthday: string, deathday: string | null): number {
  const birth = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) notFound();

  let person;
  try {
    person = await fetchPerson(tmdbId);
  } catch (error) {
    console.error("Person fetch error for ID", tmdbId, error);
    notFound();
  }

  const profileUrl = tmdbImageUrl(person.profile_path, "w500");
  const age = person.birthday ? calculateAge(person.birthday, person.deathday) : null;

  const taggedImages = person.tagged_images?.results ?? [];
  const profileImages = person.images?.profiles ?? [];

  return (
    <div>
      {/* Profile Header */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row">
        {profileUrl && (
          <div className="relative aspect-[2/3] w-[200px] shrink-0 overflow-hidden rounded-lg shadow-lg">
            <Image
              src={profileUrl}
              alt={person.name}
              fill
              priority
              sizes="200px"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">{person.name}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted">
            {person.known_for_department && (
              <span className="rounded-full bg-surface px-3 py-1">
                {person.known_for_department}
              </span>
            )}
            {person.birthday && (
              <span>
                Born {formatDate(person.birthday)}
                {age !== null && !person.deathday && ` (age ${age})`}
              </span>
            )}
            {person.deathday && (
              <span>
                Died {formatDate(person.deathday)}
                {age !== null && ` (age ${age})`}
              </span>
            )}
            {person.place_of_birth && <span>{person.place_of_birth}</span>}
          </div>

          {person.biography && (
            <p className="max-w-2xl text-sm leading-relaxed text-foreground/80">
              {person.biography.length > 800
                ? person.biography.slice(0, 800) + "..."
                : person.biography}
            </p>
          )}
        </div>
      </div>

      {/* Filmography */}
      <div className="mb-8">
        <Filmography
          castCredits={person.combined_credits?.cast ?? []}
          crewCredits={person.combined_credits?.crew ?? []}
        />
      </div>

      {/* Photo Gallery */}
      {(taggedImages.length > 0 || profileImages.length > 1) && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Photos</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {profileImages.slice(0, 10).map((img) => {
              const url = tmdbImageUrl(img.file_path, "w342");
              if (!url) return null;
              return (
                <div
                  key={img.file_path}
                  className="relative h-[200px] w-[133px] shrink-0 overflow-hidden rounded-lg"
                >
                  <Image
                    src={url}
                    alt={`${person.name} photo`}
                    fill
                    sizes="133px"
                    className="object-cover"
                  />
                </div>
              );
            })}
            {taggedImages.slice(0, 10).map((img) => {
              const url = tmdbImageUrl(img.file_path, "w342");
              if (!url) return null;
              return (
                <div
                  key={img.file_path}
                  className="relative h-[200px] w-[300px] shrink-0 overflow-hidden rounded-lg"
                >
                  <Image
                    src={url}
                    alt={`${person.name} in ${img.media?.title || img.media?.name || "production"}`}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
