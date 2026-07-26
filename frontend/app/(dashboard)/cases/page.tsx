"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { t, useLocale } from "@/lib/i18n";
import SearchPanel from "@/components/cases/SearchPanel";

// ─── API types ────────────────────────────────────────────────────────────────

interface CaseSummary {
  id: number;
  fir_number: string;
  date: string;
  crime_type: string;
  district: string;
  station?: string | null;
  status: string;
  modus_operandi?: string | null;
  accused_count?: number | null;
  victim_count?: number | null;
}

interface CasesResponse {
  items: CaseSummary[];
  total: number;
  pages: number;
}

// ─── Local components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  const safeStatus = status || "unknown";
  const map: Record<string, string> = {
    open: "bg-blue-500/10 text-blue-400",
    closed: "bg-zinc-500/10 text-zinc-400",
    pending: "bg-amber-500/10 text-amber-400",
    chargesheeted: "bg-green-500/10 text-green-400",
  };
  const cls = map[safeStatus.toLowerCase()] ?? "bg-zinc-500/10 text-zinc-400";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {safeStatus}
    </span>
  );
}

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

export default function CasesPage() {
  const { locale } = useLocale();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    keyword: "",
    crimeType: "",
    district: "",
    dateFrom: "",
    dateTo: "",
  });
  const [data, setData] = useState<CasesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<CasesResponse>("/api/cases", {
        params: {
          page,
          page_size: 20,
          ...(filters.crimeType && { crime_type: filters.crimeType }),
          ...(filters.district && { district: filters.district }),
          ...(filters.dateFrom && { date_from: filters.dateFrom }),
          ...(filters.dateTo && { date_to: filters.dateTo }),
          ...(filters.keyword && { keyword: filters.keyword }),
        },
      })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load cases");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, filters]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("cases.title", locale)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {data?.total ?? 0} cases found
        </p>
      </div>

      {/* Search / filter */}
      <SearchPanel
        keyword={filters.keyword}
        crimeType={filters.crimeType}
        district={filters.district}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />

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
          <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 bg-card border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>FIR Number</span>
            <span>Date</span>
            <span>District / Type</span>
            <span>Status</span>
            <span />
          </div>

          {/* Empty state */}
          {!data?.items.length && (
            <div className="px-4 py-10 text-sm text-center text-muted-foreground">
              No cases found.
            </div>
          )}

          {/* Data rows */}
          {data?.items.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 border-b border-border last:border-0 px-4 py-3 text-sm hover:bg-accent/30 transition-colors items-center"
            >
              <span className="font-mono font-medium">{c.fir_number}</span>
              <span className="text-muted-foreground">{c.date}</span>
              <span>
                <span className="text-muted-foreground">{c.district}</span>
                {" · "}
                <span className="capitalize">{c.crime_type}</span>
              </span>
              <StatusBadge status={c.status} />
              <Link
                href={`/cases/${c.id}`}
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
