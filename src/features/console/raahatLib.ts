/**
 * Raahat — deterministic disaster-response maths.
 * Risk scoring, hotspot data and resource allocation are computed on-device
 * (never by the LLM) so the numbers are reproducible and defensible.
 */

export interface Band {
  label: string;
  color: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function band(score: number): Band {
  if (score >= 75) return { label: "Severe", color: "#C0453B" };
  if (score >= 55) return { label: "High", color: "#E0892E" };
  if (score >= 35) return { label: "Moderate", color: "#C9A227" };
  if (score >= 18) return { label: "Low", color: "#4B9E6B" };
  return { label: "Minimal", color: "#3F9A7A" };
}

/** Flood risk from rainfall (mm), river level %, soil saturation %, drainage capacity % (higher drainage = safer). */
export function floodRisk(i: { rainfall: number; riverLevel: number; soil: number; drainage: number }) {
  const rain = (Math.min(i.rainfall, 300) / 300) * 100;
  return clamp(rain * 0.4 + i.riverLevel * 0.3 + i.soil * 0.2 + (100 - i.drainage) * 0.1);
}

/** Wildfire risk from temperature (°C), humidity % (higher = safer), wind (km/h), vegetation dryness %. */
export function wildfireRisk(i: { temp: number; humidity: number; wind: number; dryness: number }) {
  const t = (Math.min(i.temp, 50) / 50) * 100;
  const w = (Math.min(i.wind, 80) / 80) * 100;
  return clamp(t * 0.3 + (100 - i.humidity) * 0.3 + w * 0.2 + i.dryness * 0.2);
}

export type HazardType = "Flood" | "Wildfire" | "Cyclone" | "Heatwave";

export interface Alert {
  city: string;
  state: string;
  lat: number;
  lng: number;
  type: HazardType;
  level: number; // 0-100
  note: string;
}

/** Demo signal-fusion output — what a live feed of IMD + satellite + news would surface. */
export const ALERTS: Alert[] = [
  { city: "Guwahati", state: "Assam", lat: 26.14, lng: 91.74, type: "Flood", level: 82, note: "Brahmaputra above danger mark; 40+ wards waterlogged." },
  { city: "Patna", state: "Bihar", lat: 25.59, lng: 85.14, type: "Flood", level: 71, note: "Ganga rising; low-lying diara belts on alert." },
  { city: "Mumbai", state: "Maharashtra", lat: 19.08, lng: 72.88, type: "Flood", level: 64, note: "Heavy spell + high tide; Mithi river overflow risk." },
  { city: "Nainital", state: "Uttarakhand", lat: 29.38, lng: 79.46, type: "Wildfire", level: 58, note: "Dry pine forest, low humidity; multiple ground fires." },
  { city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.69, lng: 83.22, type: "Cyclone", level: 76, note: "Depression intensifying in Bay of Bengal; landfall risk." },
  { city: "Nagpur", state: "Maharashtra", lat: 21.15, lng: 79.09, type: "Heatwave", level: 61, note: "44°C+ for 3 days; red-alert for vulnerable groups." },
  { city: "Kochi", state: "Kerala", lat: 9.93, lng: 76.27, type: "Flood", level: 55, note: "Monsoon surge; backwater levels climbing." },
  { city: "Shimla", state: "Himachal Pradesh", lat: 31.10, lng: 77.17, type: "Wildfire", level: 47, note: "Forest-fire alerts on dry south-facing slopes." },
];

export interface Area {
  name: string;
  affected: number; // people
  severity: number; // 1 (low) – 3 (severe)
}

export interface ResourcePool {
  boats: number;
  foodKits: number;
  medkits: number;
  shelters: number;
}

export interface Allocation extends Area {
  share: number; // 0-1
  boats: number;
  foodKits: number;
  medkits: number;
  shelters: number;
}

/** Proportional allocation weighted by affected population × severity. */
export function allocate(areas: Area[], pool: ResourcePool): Allocation[] {
  const weights = areas.map((a) => Math.max(0, a.affected) * Math.max(1, a.severity));
  const total = weights.reduce((s, w) => s + w, 0) || 1;
  return areas.map((a, i) => {
    const share = weights[i] / total;
    return {
      ...a,
      share,
      boats: Math.round(pool.boats * share),
      foodKits: Math.round(pool.foodKits * share),
      medkits: Math.round(pool.medkits * share),
      shelters: Math.round(pool.shelters * share),
    };
  });
}

export const hazardColor: Record<HazardType, string> = {
  Flood: "#0E8FA8",
  Wildfire: "#E0892E",
  Cyclone: "#7B61C9",
  Heatwave: "#C0453B",
};
