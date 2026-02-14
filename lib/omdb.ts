export interface OMDbRatings {
  imdb: number | null;
  rottenTomatoes: number | null;
  metacritic: number | null;
}

interface OMDbResponse {
  Response: "True" | "False";
  imdbRating?: string;
  Ratings?: { Source: string; Value: string }[];
  Error?: string;
}

export async function getRatings(imdbId: string): Promise<OMDbRatings> {
  const res = await fetch(
    `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbId}`,
    { next: { revalidate: 0 } }
  );

  if (!res.ok) {
    throw new Error(`OMDb API error: ${res.status}`);
  }

  const data: OMDbResponse = await res.json();

  if (data.Response === "False") {
    return { imdb: null, rottenTomatoes: null, metacritic: null };
  }

  const imdb = data.imdbRating && data.imdbRating !== "N/A"
    ? parseFloat(data.imdbRating)
    : null;

  let rottenTomatoes: number | null = null;
  let metacritic: number | null = null;

  if (data.Ratings) {
    for (const rating of data.Ratings) {
      if (rating.Source === "Rotten Tomatoes") {
        rottenTomatoes = parseInt(rating.Value, 10);
      }
      if (rating.Source === "Metacritic") {
        const parts = rating.Value.split("/");
        metacritic = parseInt(parts[0], 10);
      }
    }
  }

  return { imdb, rottenTomatoes, metacritic };
}
