"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { t, useLocale } from "@/lib/i18n";
import { riskColour } from "@/components/offenders/RiskGauge";

// ─── API types ────────────────────────────────────────────────────────────────

interface OffenderSummary {
  id: number;
  name: string;
  age?: number | null;
  gender?: string | null;
  address?: string | null;
  photo_url?: string | null;
  risk_score: number;
  fir_count: number;
}

interface OffendersResponse {
  items: OffenderSummary[];
  total: number;
  pages: number;
}

// ─── Local components ─────────────────────────────────────────────────────────

function Pagination({
  page,
  pages,
  onPageChange,
}: {
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        Prev
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        Next
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface FilterState {
  minRisk: string;
  maxRisk: string;
  crimeType: string;
  district: string;
}

const emptyFilters: FilterState = {
  minRisk: "",
  maxRisk: "",
  crimeType: "",
  district: "",
};

const inputClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full";

export default function OffendersPage() {
  const { locale } = useLocale();

  const [page, setPage] = useState(1);
  // Draft filters (controlled inputs)
  const [draft, setDraft] = useState<FilterState>(emptyFilters);
  // Applied filters (trigger fetch)
  const [applied, setApplied] = useState<FilterState>(emptyFilters);

  const [data, setData] = useState<OffendersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<OffendersResponse>("/api/offenders", {
        params: {
          page,
          page_size: 20,
          ...(applied.minRisk && { min_risk: applied.minRisk }),
          ...(applied.maxRisk && { max_risk: applied.maxRisk }),
          ...(applied.crimeType && { crime_type: applied.crimeType }),
          ...(applied.district && { district: applied.district }),
        },
      })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load offenders",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, applied]);

  function applyFilters() {
    setApplied({ ...draft });
    setPage(1);
  }

  function resetFilters() {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("offenders.title", locale)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {data?.total ?? 0} offenders found
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-end rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-1 min-w-[110px]">
          <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Min Risk
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className={inputClass}
            value={draft.minRisk}
            onChange={(e) =>
              setDraft((d) => ({ ...d, minRisk: e.target.value }))
            }
            placeholder="0"
          />
        </div>
        <div className="flex flex-col gap-1 min-w-[110px]">
          <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Max Risk
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className={inputClass}
            value={draft.maxRisk}
            onChange={(e) =>
              setDraft((d) => ({ ...d, maxRisk: e.target.value }))
            }
            placeholder="100"
          />
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Crime Type
          </label>
          <input
            type="text"
            className={inputClass}
            value={draft.crimeType}
            onChange={(e) =>
              setDraft((d) => ({ ...d, crimeType: e.target.value }))
            }
            placeholder="e.g. theft"
          />
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            District
          </label>
          <input
            type="text"
            className={inputClass}
            value={draft.district}
            onChange={(e) =>
              setDraft((d) => ({ ...d, district: e.target.value }))
            }
            placeholder="e.g. Bengaluru"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={resetFilters}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingState />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 bg-card border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Name</span>
            <span>Age / Gender</span>
            <span>Risk Score</span>
            <span>FIR Count</span>
            <span />
          </div>

          {/* Empty state */}
          {!data?.items.length && (
            <div className="px-4 py-10 text-sm text-center text-muted-foreground">
              No offenders found.
            </div>
          )}

          {/* Data rows */}
          {data?.items.map((o) => (
            <div
              key={o.id}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-border last:border-0 px-4 py-3 text-sm hover:bg-accent/30 transition-colors items-center"
            >
              <span className="font-medium">{o.name}</span>
              <span className="text-muted-foreground text-xs">
                {o.age ?? "—"}
                {o.gender ? ` · ${o.gender}` : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: riskColour(o.risk_score) }}
                />
                {o.risk_score}
              </span>
              <span className="text-center">{o.fir_count}</span>
              <Link
                href={`/offenders/${o.id}`}
                className="text-primary text-xs hover:underline"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination page={page} pages={data?.pages ?? 1} onPageChange={setPage} />
    </div>
  );
}
