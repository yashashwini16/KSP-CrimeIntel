"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n";
import FilterPanel from "@/components/map/FilterPanel";
import TimeSlider from "@/components/map/TimeSlider";

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

// ─── Dynamic import — no SSR for Leaflet ─────────────────────────────────────

const HotspotMap = dynamic(() => import("@/components/map/HotspotMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <span className="text-sm text-muted-foreground">Loading map…</span>
    </div>
  ),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function advanceDateByDays(dateStr: string, days: number): string {
  const d = new Date(new Date(dateStr).getTime() + days * 24 * 60 * 60 * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MapPage() {
  const { locale } = useLocale();

  // Data state
  const [hotspots, setHotspots] = useState<HotspotRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    crimeType: "",
    district: "",
    dateFrom: "",
    dateTo: "",
  });

  // Time slider state
  const [timeFilter, setTimeFilter] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  // ── Fetch hotspots ──────────────────────────────────────────────────────────
  const fetchHotspots = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.crimeType) params.crime_type = filters.crimeType;
      if (filters.district) params.district = filters.district;
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;

      const res = await api.get<HotspotRecord[]>("/api/map/hotspots", {
        params,
      });
      setHotspots(res.data);
    } catch {
      setHotspots([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHotspots();
  }, [fetchHotspots]);

  // ── Derive min/max dates from fetched data ──────────────────────────────────
  const minDate =
    hotspots.length > 0
      ? hotspots.reduce(
          (min, h) => (h.date_from < min ? h.date_from : min),
          hotspots[0].date_from,
        )
      : filters.dateFrom || "2020-01-01";

  const maxDate =
    hotspots.length > 0
      ? hotspots.reduce(
          (max, h) => (h.date_to > max ? h.date_to : max),
          hotspots[0].date_to,
        )
      : filters.dateTo || new Date().toISOString().slice(0, 10);

  // Initialise timeFilter to minDate whenever hotspots change
  useEffect(() => {
    if (hotspots.length > 0 && !timeFilter) {
      setTimeFilter(minDate);
    }
  }, [hotspots, minDate, timeFilter]);

  // ── Play animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;

    const id = setInterval(() => {
      setTimeFilter((prev) => {
        if (!prev) return minDate;
        const next = advanceDateByDays(prev, 7);
        if (next > maxDate) {
          setIsPlaying(false);
          return maxDate;
        }
        return next;
      });
    }, 800);

    return () => clearInterval(id);
  }, [isPlaying, minDate, maxDate]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card shrink-0">
        <h1 className="text-lg font-semibold">{t("map.title", locale)}</h1>
        <span className="text-sm text-muted-foreground">
          {loading
            ? t("common.loading", locale)
            : `${hotspots.length} locations`}
        </span>
      </div>

      {/* Map area — relative, takes all remaining space */}
      <div className="relative flex-1 overflow-hidden">
        <HotspotMap hotspots={hotspots} timeFilter={timeFilter || undefined} />

        {/* Filter panel — absolute top-left overlay */}
        <div className="absolute top-4 left-4 z-[1000] w-64">
          <FilterPanel
            crimeType={filters.crimeType}
            district={filters.district}
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onChange={(f) => {
              setTimeFilter(""); // reset slider on new filter
              setIsPlaying(false);
              setFilters(f);
            }}
          />
        </div>

        {/* Time slider — absolute bottom overlay */}
        {hotspots.length > 0 && timeFilter && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[min(600px,90%)]">
            <TimeSlider
              minDate={minDate}
              maxDate={maxDate}
              value={timeFilter}
              onChange={setTimeFilter}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying((p) => !p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
