"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MiniMapProps {
  /** Array of locations (case detail — multiple pins). */
  locations?: MapLocation[];
  /** Single coordinate mode (offender profile — one pin). */
  latitude?: number;
  longitude?: number;
  address?: string;
  height?: string;
}

// ─── Tile layer ───────────────────────────────────────────────────────────────

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

// ─── Component ────────────────────────────────────────────────────────────────

export default function MiniMap({
  locations,
  latitude,
  longitude,
  address,
  height = "200px",
}: MiniMapProps) {
  // Normalise to a flat list of pins
  const pins: MapLocation[] = locations?.length
    ? locations
    : latitude != null && longitude != null
      ? [{ latitude, longitude, address }]
      : [];

  if (!pins.length) return null;

  const center: [number, number] = [pins[0].latitude, pins[0].longitude];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height, width: "100%", background: "#09090b" }}
      className="rounded-lg"
      scrollWheelZoom={false}
      dragging={true}
      zoomControl={false}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
      {pins.map((loc, idx) => (
        <CircleMarker
          key={`${loc.latitude}-${loc.longitude}-${idx}`}
          center={[loc.latitude, loc.longitude]}
          radius={8}
          pathOptions={{
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.8,
            weight: 2,
          }}
        >
          <Popup>
            <div className="min-w-[140px] text-sm">
              <p className="font-medium">{loc.address ?? "Location"}</p>
              <p className="text-xs text-zinc-500">
                {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
