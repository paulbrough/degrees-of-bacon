# Degrees of Bacon

## Project Overview

A personal media discovery tool — like IMDB but focused on answering the questions you actually have: "Where do I know that actor from?", "What else did this director make?", "Is this worth watching?", and "What do these two shows have in common?"

Built to be used personally but architected to support a few hundred users on free hosting tiers.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: Supabase (Postgres) via Prisma ORM
- **Auth**: Supabase Auth (email/password + OAuth)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS
- **Data Sources**: TMDB API (primary), OMDb API (IMDB ratings supplement)

## API Keys & Environment Variables

```
TMDB_API_KEY=           # https://www.themoviedb.org/settings/api
TMDB_API_READ_TOKEN=    # Bearer token from same page (v4 auth)
OMDB_API_KEY=           # https://www.omdbapi.com/apikey.aspx
NEXT_PUBLIC_SUPABASE_URL=       # Supabase → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase → Settings → API → anon public
SUPABASE_SERVICE_ROLE_KEY=      # Supabase → Settings → API → service_role
DATABASE_URL=                    # Supabase → Settings → Database → Connection string (URI format). Replace [YOUR-PASSWORD] with the password you set when creating the project.
```

## Data Sources

### TMDB API (primary)

- Base URL: `https://api.themoviedb.org/3`
- Auth: Bearer token in header (`Authorization: Bearer {TMDB_API_READ_TOKEN}`)
- Rate limit: ~40 requests per 10 seconds
- Image base URL: `https://image.tmdb.org/t/p/{size}{path}` — sizes include `w92`, `w185`, `w342`, `w500`, `w780`, `original`
- Key endpoints:
  - `/search/multi?query=` — search movies, TV, people in one call
  - `/movie/{id}?append_to_response=credits,images,recommendations,similar` — movie detail with credits in one call
  - `/tv/{id}?append_to_response=credits,images,recommendations,similar` — TV detail with credits in one call
  - `/person/{id}?append_to_response=combined_credits,images,tagged_images` — person detail with filmography and tagged photos (photos of the person in specific productions)
  - `/discover/movie` and `/discover/tv` — advanced filtering
- The `append_to_response` parameter is critical for efficiency — it bundles multiple data requests into a single API call
- Attribution required: must display "Powered by TMDB" logo with link per their terms

### OMDb API (IMDB ratings supplement)

- Base URL: `https://www.omdbapi.com/?apikey={OMDB_API_KEY}`
- Rate limit: 1,000 requests/day (free tier)
- Key params: `?i={imdb_id}` returns IMDB rating, Rotten Tomatoes, Metacritic
- TMDB provides the `imdb_id` field on movie/TV detail responses, use that to look up OMDb

## Database Schema (Prisma)

### Core tables

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  seenItems SeenItEntry[]
}

model SeenItEntry {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  tmdbId       Int
  mediaType    String   // "movie" | "tv"
  title        String   // denormalized for quick display
  posterPath   String?  // denormalized
  addedAt      DateTime @default(now())

  @@unique([userId, tmdbId, mediaType])
  @@index([userId])
}
```

### Cache tables

```prisma
model CachedProduction {
  id           String   @id @default(uuid())
  tmdbId       Int
  mediaType    String   // "movie" | "tv"
  data         Json     // full TMDB response including credits
  imdbRating   Float?   // from OMDb, cached separately so it can refresh
  cachedAt     DateTime @default(now())
  
  @@unique([tmdbId, mediaType])
  @@index([tmdbId, mediaType])
}

model CachedPerson {
  id        String   @id @default(uuid())
  tmdbId    Int      @unique
  data      Json     // full TMDB person response including combined_credits and tagged_images
  cachedAt  DateTime @default(now())
  
  @@index([tmdbId])
}
```

### Cache strategy

- TTL: 7 days for production/person data, 30 days for IMDB ratings
- On cache miss: fetch from TMDB/OMDb, store in cache table, return to client
- On cache hit within TTL: return cached data, no external API call
- On cache hit past TTL: return cached data immediately, trigger background refresh
- All TMDB/OMDb calls go through server-side API routes — never call from the client

## Features

### 1. Search

- Universal search bar (always visible in header/nav)
- Uses TMDB `/search/multi` — returns movies, TV shows, and people in one call
- Results grouped by type with poster thumbnails
- Debounced input (300ms) with dropdown results, full results page on enter

### 2. Production Detail Page (`/movie/[id]` and `/tv/[id]`)

- Hero section: poster, backdrop image, title, year, genres, runtime, overview
- Ratings: TMDB rating displayed, IMDB rating fetched via OMDb (lazy-loaded, cached)
- Cast & crew: scrollable list with headshots, character names, roles
  - Clicking a person navigates to their person page
- Key crew highlighted: director(s), creator(s)/showrunner(s), writers, producers
- "Compare with..." button — navigates to compare page with this production pre-filled
- "Mark as Seen" / "Seen" toggle button
- Recommendations section: TMDB's built-in recommendations + similar titles
- Images/screenshots gallery from TMDB images endpoint

### 3. Person Detail Page (`/person/[id]`)

- Profile photo, name, birthday (and calculated current age), bio
- Filmography: full list from `combined_credits`, sorted by date, filterable by type (movie/TV/all)
  - Each entry shows: poster thumbnail, title, year, their role/character, and the production's rating
- **"Where Do I Know Them From?"** button (opt-in, prominent placement)
  - When clicked, runs prediction logic (see section 7)
  - Shows results in tiers: ✅ Confirmed (you've seen this), 🟡 Likely, 🔵 Possible
  - Each result shows: production title, poster, their character name, and a tagged photo if available
- Photo gallery: profile photos + tagged images (photos of them in specific productions)
- "Compare" shortcut: pick any two productions from their filmography to compare

### 4. Compare Page (`/compare`)

- Two search/select fields — pick two productions
- Can arrive with one or both pre-filled (via URL params)
- Results show shared people grouped by department/role:
  - Actors (with character names in each production)
  - Directors
  - Writers
  - Producers
  - Other crew
- Each person entry is clickable → navigates to their person page
- **"Include likely watches"** toggle (off by default)
  - When enabled, factors in predicted seen list for the "what else connects these" context
- Visual design: side-by-side layout with the overlap in the center

### 5. Seen It (`/seenit`)

- Grid/list view of everything you've marked as seen
- Sortable: date added, title, year, rating
- Filterable: movies/TV/all, genre
- Search within seen items
- Quick-remove button on each entry
- Used as input for the prediction engine and the compare feature

### 6. Ratings Display

- Show TMDB rating on all production cards and detail pages (always available, no extra API call)
- Show IMDB rating on detail pages (fetched via OMDb using IMDB ID from TMDB)
- Cache IMDB ratings in the database (30-day TTL)
- Display both ratings side-by-side where available
- Consider a simple color scale: green (7+), yellow (5-7), red (below 5)

### 7. "Where Do I Know Them From?" — Prediction Engine

This is opt-in only. It runs when a user clicks the button on a person page.

**Logic:**

1. Fetch the person's full filmography (from cache or TMDB)
2. Get the user's explicit seen list
3. Immediately separate: ✅ Confirmed = intersection of filmography and seen list
4. For remaining titles, score each using:
   - **Popularity** (TMDB `popularity` field): heavily popular titles score higher — if 50M people watched it and you watch that genre, odds are you did too
   - **Genre overlap**: compare genres against the user's seen list genre distribution
   - **Network/platform match**: if the user watches a lot of HBO or Netflix originals, weight those higher
   - **Cast/crew overlap**: if 3 other actors from the user's seen list are also in this title, score it higher
   - **Era clustering**: if the user's seen list is heavy on 2015-2020 content, titles from that era score higher
5. Classify: 🟡 Likely (score above threshold X), 🔵 Possible (score above threshold Y)
6. Return results with confidence tiers

**Important implementation notes:**
- All scoring runs against cached data + seen list — minimal API calls needed at runtime
- Cache the prediction results per user per person for the session
- Show a brief loading state when calculating
- This feature improves as the seen list grows — note that to the user if their seen list is small

### 8. Discovery / Home Page (`/`)

- Trending movies and TV (TMDB `/trending/all/week`)
- Personalized section if logged in with seen items: "Because you watched X" using TMDB recommendations endpoint seeded by recent seen items
- Popular and top-rated sections
- All sections are horizontally scrollable cards with poster, title, year, rating

## API Route Structure

All external API calls are server-side only:

```
/api/search?q={query}                    → TMDB multi search (with caching)
/api/movie/[id]                          → cached production detail
/api/tv/[id]                             → cached production detail  
/api/person/[id]                         → cached person detail
/api/ratings/[imdbId]                    → cached OMDb rating lookup
/api/compare?a={id}&aType={type}&b={id}&bType={type} → compare two productions
/api/predict/[personId]                  → "Where do I know them from?" engine
/api/seenit                              → CRUD for seen entries
/api/trending                            → cached trending content
```

## UI/UX Guidelines

- Clean, dark theme by default (media apps look better dark). Optional light mode.
- Poster-forward design — images do the heavy lifting, not text walls
- Responsive: works on desktop and mobile
- Fast: cache-first strategy means most interactions feel instant after initial load
- Minimal chrome: search bar, main content, minimal nav
- TMDB attribution in footer per their terms

## Performance & Efficiency Targets

- **Goal**: stay within free tiers at a few hundred users
- Supabase free: 500MB DB, 5GB bandwidth, 50k MAU — plenty of headroom
- Vercel free: 100GB bandwidth, 100k function invocations — comfortable
- TMDB: 40 req/10s — caching makes this a non-issue. Most pages should be 0-1 API calls for cached content
- OMDb: 1,000 req/day — only fetch ratings on detail page view for uncached titles. At a few hundred users, the cache covers most lookups
- Use `append_to_response` on every TMDB call to bundle data
- Implement stale-while-revalidate: serve cached data immediately, refresh in background if past TTL

## Testing

- Use Playwright for E2E testing (user has the Playwright Claude Code plugin)
- Test flows: search → detail page, mark as seen/remove, compare two productions, "Where do I know them from?" flow
- Test cache behavior: verify API calls are avoided on cache hits

## Project Structure

```
/app
  /page.tsx                  — home/discovery
  /search/page.tsx           — search results
  /movie/[id]/page.tsx       — movie detail
  /tv/[id]/page.tsx          — TV detail
  /person/[id]/page.tsx      — person detail
  /compare/page.tsx          — compare two productions
  /seenit/page.tsx           — user's seen items
  /api/
    /search/route.ts
    /movie/[id]/route.ts
    /tv/[id]/route.ts
    /person/[id]/route.ts
    /ratings/[imdbId]/route.ts
    /compare/route.ts
    /predict/[personId]/route.ts
    /seenit/route.ts
    /trending/route.ts
/lib
  /tmdb.ts                   — TMDB API client
  /omdb.ts                   — OMDb API client
  /cache.ts                  — cache read/write/invalidation logic
  /prediction.ts             — "Where do I know them from?" scoring engine
  /supabase.ts               — Supabase client setup
/prisma
  /schema.prisma
/components
  /SearchBar.tsx
  /ProductionCard.tsx
  /PersonCard.tsx
  /RatingBadge.tsx
  /SeenItButton.tsx
  /CompareView.tsx
  /PredictionResults.tsx
```

## Implementation Order (suggested)

1. Project setup: Next.js, Tailwind, Prisma, Supabase connection
2. TMDB API client with caching layer
3. Search (universal search bar + results page)
4. Production detail pages (movie + TV)
5. Person detail pages with filmography
6. Seen It (mark as seen/remove/view)
7. OMDb integration for IMDB ratings
8. Compare feature
9. "Where Do I Know Them From?" prediction engine
10. Home/discovery page with trending and personalized content
11. Auth (Supabase Auth)
12. Polish: responsive design, loading states, error handling, image optimization
