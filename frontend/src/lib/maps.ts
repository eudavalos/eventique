import type { Venue } from '../types';

const DYNAMIC_MAP_HOSTS = ['maps.app.goo.gl', 'goo.gl', 'app.goo.gl', 'page.link'];

function isDynamicMapsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return DYNAMIC_MAP_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function buildVenueQuery(venue: Pick<Venue, 'name' | 'address' | 'city' | 'country'>): string {
  return [venue.name, venue.address, venue.city, venue.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
}

export function getVenueMapsUrl(venue: Pick<Venue, 'name' | 'address' | 'city' | 'country' | 'mapsUrl'>): string | null {
  const rawUrl = venue.mapsUrl?.trim();
  if (rawUrl && !isDynamicMapsUrl(rawUrl)) return rawUrl;

  const query = buildVenueQuery(venue);
  if (!query) return rawUrl || null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
