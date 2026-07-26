"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { t, useLocale } from "@/lib/i18n";
import DateRangeFilter from "@/components/analytics/DateRangeFilter";
import DashboardCharts from "@/components/analytics/DashboardCharts";

interface AnalyticsSummary {
  total_cases: number;
  open_cases: number;
  closed_cases: number;
  cases_by_type: Record<string, number>;
  cases_by_district: Record<string, number>;
  victim_demographics: Record<string, number>;
  modus_operandi_frequency: Record<string, number>;
  crime_trend: Array<{ date: string; count: number; label?: string }>;
}

interface KpiCard {
  label: string;
  value: number | string;
  accent?: string;
}

export default function DashboardPage() {
  const { locale } = useLocale();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError(false);
    try {
      const params: Record<string, string> = {};
      if (from) params.date_from = from;
      if (to) params.date_to = to;
      const res = await api.get<AnalyticsSummary>("/api/analytics/summary", {
        params,
      });
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(dateFrom, dateTo);
  }, [fetchData, dateFrom, dateTo]);

  function handleDateChange(from: string, to: string) {
    setDateFrom(from);
    setDateTo(to);
  }

  const kpiCards: KpiCard[] = data
    ? [
        {
          label: t("dashboard.open_cases", locale),
          value: data.open_cases,
          accent: "#6366f1",
        },
        {
          label: t("dashboard.total_firs", locale),
          value: data.total_cases,
          accent: "#22c55e",
        },
        {
          label: t("common.closed", locale),
          value: data.closed_cases,
          accent: "#f59e0b",
        },
        {
          label: t("dashboard.active_alerts", locale),
          value: data.open_cases + data.closed_cases,
          accent: "#8b5cf6",
        },
      ]
    : [
        { label: t("dashboard.open_cases", locale), value: "—" },
        { label: t("dashboard.total_firs", locale), value: "—" },
        { label: t("common.closed", locale), value: "—" },
        { label: t("dashboard.active_alerts", locale), value: "—" },
      ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("dashboard.title", locale)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("dashboard.subtitle", locale)}
        </p>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-card p-5"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Date range filter */}
      <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onChange={handleDateChange}
      />

      {/* Charts */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load analytics.{" "}
            <button
              onClick={() => fetchData(dateFrom, dateTo)}
              className="text-primary underline-offset-4 hover:underline"
            >
              Retry
            </button>
          </p>
        </div>
      ) : data ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <DashboardCharts data={data} />
        </div>
      ) : null}
    </div>
  );
}
