const STORAGE_KEY = "degrees-of-bacon:recent-clicks";
const MAX_ITEMS = 20;

export interface RecentClick {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  known_for_department?: string;
  clickedAt: number;
}

export function getRecentClicks(): RecentClick[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items: RecentClick[] = JSON.parse(raw);
    return items.sort((a, b) => b.clickedAt - a.clickedAt);
  } catch {
    return [];
  }
}

export function addRecentClick(
  item: Omit<RecentClick, "clickedAt">,
): RecentClick[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getRecentClicks();
    const deduped = existing.filter(
      (e) => !(e.id === item.id && e.media_type === item.media_type),
    );
    const entry: RecentClick = { ...item, clickedAt: Date.now() };
    const updated = [entry, ...deduped].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function removeRecentClick(id: number, mediaType: string): RecentClick[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getRecentClicks();
    const filtered = existing.filter(
      (item) => !(item.id === id && item.media_type === mediaType)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
}
