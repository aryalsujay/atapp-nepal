/**
 * Travel estimates from a teacher's home region to a Dhamma centre.
 *
 * The prototype hardcoded `distanceKm` / `travelHrs` per course (all measured
 * from Kathmandu). In the rebuild we compute it dynamically from the
 * teacher's preferred-regions[0] anchor → the centre's lat/lng via the
 * Haversine formula, multiplied by a Nepal-roads detour factor and divided
 * by an average ground speed.
 *
 * Tunables live in `TravelConfig` so admin/UX can iterate without code edits.
 */

import centersData from '@/data/centers.json';

type Coord = { lat: number; lng: number };

/** Canonical origin coords per teacher `preferredRegions[0]` value. */
const REGION_ORIGINS: Record<string, Coord & { city: string }> = {
  'Kathmandu Valley': { city: 'Kathmandu', lat: 27.7172, lng: 85.324 },
  'Pokhara & Gandaki': { city: 'Pokhara', lat: 28.2096, lng: 83.9856 },
  'Lumbini & Terai': { city: 'Lumbini', lat: 27.4833, lng: 83.2767 },
  'Chitwan & Central Terai': { city: 'Bharatpur', lat: 27.6766, lng: 84.4358 },
  'Janakpur & Madhesh': { city: 'Janakpur', lat: 26.7271, lng: 85.9407 },
  'Eastern Hills': { city: 'Dharan', lat: 26.8147, lng: 87.2769 },
};

export const TravelConfig = {
  /** Haversine returns straight-line km; multiply for road detours. */
  roadDetourFactor: 1.45,
  /** Avg ground speed in km/h on Nepal roads (mix of highway + hill). */
  avgSpeedKmh: 35,
} as const;

type CenterRow = { name: string; city?: string; lat?: number; lng?: number; altitude?: number };
const CENTERS = centersData as CenterRow[];

function findCenter(centerName: string): CenterRow | undefined {
  return CENTERS.find((c) => c.name === centerName);
}

function haversineKm(a: Coord, b: Coord): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function originForRegion(region: string | undefined): (Coord & { city: string }) | null {
  if (!region) return null;
  return REGION_ORIGINS[region] ?? REGION_ORIGINS['Kathmandu Valley'];
}

export type Travel = {
  distanceKm: number;
  travelHrs: number;
  travelLabel: string; // "~2h 15m" or "~45 min" or "~0 — same city"
  altitude: number;
};

/** Format hours-decimal as "Xh Ym" / "Y min" / "same city". */
export function formatTravelTime(hours: number): string {
  if (hours <= 0.05) return 'same city';
  const totalMin = Math.round(hours * 60);
  if (totalMin < 60) return `~${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `~${h}h` : `~${h}h ${m}m`;
}

function travelFromCoords(origin: Coord, target: CenterRow): Travel | null {
  if (target.lat == null || target.lng == null) return null;
  const straight = haversineKm(origin, { lat: target.lat, lng: target.lng });
  const distanceKm = Math.round(straight * TravelConfig.roadDetourFactor);
  const travelHrs = distanceKm / TravelConfig.avgSpeedKmh;
  return {
    distanceKm,
    travelHrs: Math.round(travelHrs * 10) / 10,
    travelLabel: formatTravelTime(travelHrs),
    altitude: target.altitude ?? 0,
  };
}

/**
 * Compute distance + travel estimate from a teacher's home region to a
 * named centre. Returns `null` if either side is missing coordinates.
 */
export function travelFromRegionToCenter(
  region: string | undefined,
  centerName: string,
): Travel | null {
  const origin = originForRegion(region);
  const target = findCenter(centerName);
  if (!origin || !target) return null;
  return travelFromCoords(origin, target);
}

/**
 * Compute distance + travel estimate from an exact origin (lat/lng) to a
 * named centre. Preferred over `travelFromRegionToCenter` when the teacher
 * has a specific `homeLat`/`homeLng` recorded.
 */
export function travelFromCoordsToCenter(
  origin: { lat: number | null | undefined; lng: number | null | undefined } | null | undefined,
  centerName: string,
): Travel | null {
  if (!origin || origin.lat == null || origin.lng == null) return null;
  const target = findCenter(centerName);
  if (!target) return null;
  return travelFromCoords({ lat: origin.lat, lng: origin.lng }, target);
}

/**
 * Prefer explicit home coords; fall back to region anchor. The common
 * entry point for screens that have a `TeacherProfile` (or similar) handy.
 */
export function travelFor(
  origin:
    | {
        homeLat?: number | null;
        homeLng?: number | null;
        preferredRegions?: string[];
      }
    | null
    | undefined,
  centerName: string,
): Travel | null {
  if (!origin) return null;
  if (origin.homeLat != null && origin.homeLng != null) {
    return travelFromCoordsToCenter({ lat: origin.homeLat, lng: origin.homeLng }, centerName);
  }
  return travelFromRegionToCenter(origin.preferredRegions?.[0], centerName);
}
