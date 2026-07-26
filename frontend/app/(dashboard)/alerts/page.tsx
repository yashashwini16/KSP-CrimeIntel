"use client";

import { useState, useEffect } from "react";
import { t, useLocale } from "@/lib/i18n";
import api from "@/lib/api";
import AlertsPanel, { type AlertSchema } from "@/components/alerts/AlertsPanel";

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export default function AlertsPage() {
  const { locale } = useLocale();

  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [data, setData] = useState<PaginatedResponse<AlertSchema> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: "20",
        });
        if (severity) params.set("severity", severity);
        if (dateFrom) params.set("date_from", dateFrom);
        if (dateTo) params.set("date_to", dateTo);

        const res = await api.get<PaginatedResponse<AlertSchema>>(
          `/api/alerts?${params.toString()}`,
        );
        setData(res.data);
      } catch {
        // silently ignore — aborted requests or transient failures
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    return () => controller.abort();
  }, [page, severity, dateFrom, dateTo]);

  const handleSeverityChange = (val: string) => {
    setSeverity(val);
    setPage(1);
  };

  const handleDateFromChange = (val: string) => {
    setDateFrom(val);
    setPage(1);
  };

  const handleDateToChange = (val: string) => {
    setDateTo(val);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("alerts.title", locale)}
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time and historical alerts
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => handleSeverityChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleDateToChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Alerts list */}
      <AlertsPanel
        alerts={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        pages={data?.pages ?? 1}
        loading={loading}
        onPageChange={setPage}
      />
    </div>
  );
}
