"use client";

import { useState, useEffect } from "react";
import { t, useLocale } from "@/lib/i18n";
import api from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuditLogSchema {
  id: number;
  user_id: number;
  action_type: string;
  resource_type?: string | null;
  resource_id?: string | null;
  timestamp: string;
  ip_address?: string | null;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const { locale } = useLocale();

  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState("");
  const [data, setData] = useState<PaginatedResponse<AuditLogSchema> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: "20",
        });
        if (actionType) params.set("action_type", actionType);

        const res = await api.get<PaginatedResponse<AuditLogSchema>>(
          `/api/audit-logs?${params.toString()}`,
        );
        setData(res.data);
      } catch {
        // silently ignore transient failures
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, actionType]);

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("audit.title", locale)}
        </h1>
        <p className="text-sm text-muted-foreground">
          System activity and access records
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Action Type
          </label>
          <input
            type="text"
            value={actionType}
            onChange={(e) => {
              setActionType(e.target.value);
              setPage(1);
            }}
            placeholder="e.g. login, query…"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Log table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Action</span>
          <span>Resource</span>
          <span>User</span>
          <span>Timestamp</span>
          <span>IP</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading audit logs…
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No audit logs found
          </div>
        ) : (
          items.map((log) => (
            <div
              key={log.id}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 border-b border-border px-4 py-3 text-sm last:border-0"
            >
              <span className="font-medium">{log.action_type}</span>
              <span className="text-muted-foreground">
                {log.resource_type ?? "—"}&nbsp;#{log.resource_id ?? "—"}
              </span>
              <span className="text-muted-foreground">User {log.user_id}</span>
              <span className="text-muted-foreground">
                {formatTime(log.timestamp)}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {log.ip_address ?? "—"}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page <= 1}
          className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>
        <span className="text-xs text-muted-foreground">
          Page {page} of {data?.pages ?? 1}&ensp;·&ensp;{data?.total ?? 0} total
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (data?.pages ?? 1)}
          className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
