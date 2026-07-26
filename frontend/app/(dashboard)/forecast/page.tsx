"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { t, useLocale } from "@/lib/i18n";
import type { Locale } from "@/types";
import ForecastChart from "@/components/forecast/ForecastChart";
import ForecastSummary from "@/components/forecast/ForecastSummary";

interface ForecastPoint {
  date: string;
  district: string;
  crime_type: string;
  count: number;
  predicted: boolean;
}

interface ForecastResponse {
  historical: ForecastPoint[];
  forecast: ForecastPoint[];
  summary: string;
}

export default function ForecastPage() {
  const { locale } = useLocale();
  const [district, setDistrict] = useState("");
  const [crimeType, setCrimeType] = useState("");
  const [language, setLanguage] = useState<Locale>(locale);

  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async (d: string, ct: string, lang: string) => {
    setLoading(true);
    setError(false);
    try {
      const params: Record<string, string> = { language: lang };
      if (d) params.district = d;
      if (ct) params.crime_type = ct;
      const res = await api.get<ForecastResponse>("/api/forecast", { params });
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData("", "", locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch() {
    fetchData(district, crimeType, language);
  }

  function handleLanguageToggle() {
    const next: Locale = language === "en" ? "kn" : "en";
    setLanguage(next);
    fetchData(district, crimeType, next);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("forecast.title", locale)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("forecast.subtitle", locale)}
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("forecast.district", locale)}
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="e.g. Bengaluru"
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-44"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("forecast.crime_type", locale)}
          </label>
          <input
            type="text"
            value={crimeType}
            onChange={(e) => setCrimeType(e.target.value)}
            placeholder="e.g. robbery"
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-44"
          />
        </div>

        <button
          onClick={handleSearch}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t("common.search", locale)}
        </button>

        <button
          onClick={handleLanguageToggle}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {t("common.language", locale)}: {language.toUpperCase()}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load forecast.{" "}
            <button
              onClick={() => fetchData(district, crimeType, language)}
              className="text-primary underline-offset-4 hover:underline"
            >
              {t("common.retry", locale)}
            </button>
          </p>
        </div>
      ) : data ? (
        <>
          <ForecastChart
            historical={data.historical}
            forecast={data.forecast}
          />
          <ForecastSummary summary={data.summary} />
        </>
      ) : null}
    </div>
  );
}
