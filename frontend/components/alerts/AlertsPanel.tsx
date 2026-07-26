"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Exported utilities (used by property tests) ──────────────────────────────

export const VALID_SEVERITIES = ["low", "medium", "high", "critical"] as const;

export function isValidAlertSeverity(severity: string): boolean {
  return (VALID_SEVERITIES as readonly string[]).includes(severity);
}

export function formatAlertTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AlertSchema {
  id: number;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  fir_id?: number | null;
  is_read: boolean;
  created_at: string;
}

interface AlertsPanelProps {
  alerts: AlertSchema[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

// ── Severity style maps — fully static strings so Tailwind includes them ──────

const BADGE_CLASSES: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400",
  high: "bg-orange-500/10 text-orange-400",
  medium: "bg-amber-500/10 text-amber-400",
  low: "bg-green-500/10 text-green-400",
};

const BORDER_CLASSES: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-amber-500",
  low: "border-l-green-500",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AlertsPanel({
  alerts,
  total,
  page,
  pages,
  loading,
  onPageChange,
}: AlertsPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Loading alerts…
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <Bell size={32} strokeWidth={1.5} />
        <span className="text-sm">No alerts found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Alert cards */}
      <div className="flex flex-col gap-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "flex flex-col gap-1 rounded-lg border border-l-4 bg-card p-4",
              BORDER_CLASSES[alert.severity] ?? "border-l-border"
            )}
          >
            {/* Top row: badge + timestamp */}
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  BADGE_CLASSES[alert.severity] ?? "bg-muted text-muted-foreground"
                )}
              >
                {alert.severity}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatAlertTime(alert.created_at)}
              </span>
            </div>

            {/* Title */}
            <p className="text-sm font-medium">{alert.title}</p>

            {/* Optional FIR reference */}
            {alert.fir_id != null && (
              <p className="text-xs text-muted-foreground">FIR #{alert.fir_id}</p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>
        <span className="text-xs text-muted-foreground">
          Page {page} of {pages}&ensp;·&ensp;{total} total
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
