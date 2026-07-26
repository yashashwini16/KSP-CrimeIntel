"use client";
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HotspotRecord {
  latitude: number;
  longitude: number;
  district: string;
  fir_count: number;
  fir_ids: number[];
  most_frequent_crime_type: string;
  crime_type: string;
  date_from: string; // "YYYY-MM-DD"
  date_to: string;
}

interface HotspotMapProps {
  hotspots: HotspotRecord[];
  timeFilter?: string; // "YYYY-MM-DD" — only show hotspots where date_from <= timeFilter <= date_to
}

// ─── Tile layer ───────────────────────────────────────────────────────────────

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

// ─── Pure colour helper ───────────────────────────────────────────────────────

/**
 * Interpolate heat colour: blue (cold) → amber → red (hot).
 * Blue:  r=0,   g=100, b=255
 * Amber: r=255, g=165, b=0
 * Red:   r=220, g=38,  b=38
 */
export function heatColour(
  count: number,
  max: number,
): { r: number; g: number; b: number } {
  if (max <= 0 || count <= 0) return { r: 0, g: 100, b: 255 };
  const ratio = Math.min(count / max, 1);
  if (ratio <= 0.5) {
    const t = ratio * 2; // 0→1
    return {
      r: Math.round(0 + t * 255), // 0   → 255
      g: Math.round(100 + t * 65), // 100 → 165
      b: Math.round(255 - t * 255), // 255 → 0
    };
  } else {
    const t = (ratio - 0.5) * 2; // 0→1
    return {
      r: Math.round(255), // stays 255
      g: Math.round(165 - t * 165), // 165 → 0
      b: 0,
    };
  }
}

function toHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HotspotMap({ hotspots, timeFilter }: HotspotMapProps) {
  const { locale } = useLocale();

  // Filter by timeFilter if provided
  const visible = timeFilter
    ? hotspots.filter(
        (h) => h.date_from <= timeFilter && timeFilter <= h.date_to,
      )
    : hotspots;

  const maxCount = Math.max(1, ...visible.map((h) => h.fir_count));

  return (
    <MapContainer
      center={[15.3173, 75.7139]}
      zoom={7}
      style={{ height: "100%", width: "100%", background: "#09090b" }}
      className="rounded-lg"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTR} />

      {visible.map((hotspot, idx) => {
        const colour = heatColour(hotspot.fir_count, maxCount);
        const hex = toHex(colour);
        const radius = Math.sqrt(hotspot.fir_count) * 8;

        return (
          <CircleMarker
            key={`${hotspot.latitude}-${hotspot.longitude}-${idx}`}
            center={[hotspot.latitude, hotspot.longitude]}
            radius={radius}
            pathOptions={{
              color: hex,
              fillColor: hex,
              fillOpacity: 0.75,
              weight: 1,
            }}
          >
            <Popup>
              <div className="min-w-[160px] space-y-1 text-sm">
                <p className="font-semibold">{hotspot.district}</p>
                <p>
                  <span className="text-zinc-500">
                    {t("map.fir_count", locale)}:{" "}
                  </span>
                  <span className="font-medium">{hotspot.fir_count}</span>
                </p>
                <p>
                  <span className="text-zinc-500">
                    {t("map.most_common", locale)}:{" "}
                  </span>
                  <span>{hotspot.most_frequent_crime_type}</span>
                </p>
                <p>
                  <span className="text-zinc-500">
                    {t("map.date_range", locale)}:{" "}
                  </span>
                  <span>
                    {hotspot.date_from} — {hotspot.date_to}
                  </span>
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
