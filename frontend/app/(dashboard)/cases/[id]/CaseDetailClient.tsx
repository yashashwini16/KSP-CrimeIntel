"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, User, Shield } from "lucide-react";
import dynamic from "next/dynamic";
import type { AxiosError } from "axios";
import api from "@/lib/api";
import { t, useLocale } from "@/lib/i18n";
import ExportButton from "@/components/shared/ExportButton";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const MiniMap = dynamic(() => import("@/components/shared/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] rounded-lg bg-zinc-900 flex items-center justify-center text-xs text-muted-foreground">
      Loading map…
    </div>
  ),
});

// ─── API types ────────────────────────────────────────────────────────────────

interface AccusedPerson {
  id: number;
  name: string;
  age?: number;
  gender?: string;
  role?: string;
}

interface VictimPerson {
  id: number;
  name?: string;
  age?: number;
  gender?: string;
  injury_type?: string;
}

interface CaseLocation {
  id: number;
  latitude: number;
  longitude: number;
  address?: string;
}

interface AuditEntry {
  id: number;
  user_id: number;
  action_type: string;
  resource_type?: string;
  resource_id?: string;
  timestamp: string;
  ip_address?: string;
}

interface CaseDetail {
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
  narrative?: string | null;
  created_at: string;
  accused: AccusedPerson[];
  victims: VictimPerson[];
  locations: CaseLocation[];
  audit_trail: AuditEntry[];
}

interface SimilarCase {
  id: number;
  fir_number: string;
  crime_type: string;
  district: string;
  similarity_score: number;
  rationale?: string | null;
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <div className="relative ml-3 border-l-2 border-border pl-6 space-y-5">
      {sorted.map((entry) => (
        <div key={entry.id} className="relative">
          <span
            className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-border bg-primary"
          />
          <div className="text-sm">
            <p className="font-medium text-foreground">{entry.action_type}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(entry.timestamp).toLocaleString("en-IN")}
              {entry.ip_address ? ` · ${entry.ip_address}` : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────────

export default function CaseDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useLocale();
  const id = String(params.id);

  const [data, setData] = useState<CaseDetail | null>(null);
  const [similar, setSimilar] = useState<SimilarCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get<CaseDetail>(`/api/cases/${id}`),
      api.get<SimilarCase[]>(`/api/cases/${id}/similar`),
    ])
      .then(([caseRes, similarRes]) => {
        if (!cancelled) {
          setData(caseRes.data);
          setSimilar(similarRes.data.slice(0, 5));
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = (err as AxiosError)?.response?.status;
        if (status === 404) {
          router.replace("/cases");
          return;
        }
        setError(
          err instanceof Error ? err.message : t("common.error", locale),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, router, locale]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error ?? t("common.error", locale)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      {/* Back */}
      <Link
        href="/cases"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft size={14} />
        {t("common.back", locale)}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-mono">
            {data.fir_number}
          </h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            {data.district} · {data.crime_type} ·{" "}
            <StatusBadge status={data.status} />
          </p>
        </div>
        <ExportButton
          endpoint={`/api/export/case/${id}`}
          label={t("cases.export", locale)}
        />
      </div>

      {/* Narrative + meta */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            {t("cases.narrative", locale)}
          </h2>
          <p className="text-sm leading-6">
            {data.narrative ?? "—"}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <MetaRow label={t("cases.date", locale)} value={data.date} />
          <MetaRow label={t("cases.station", locale)} value={data.station ?? "—"} />
          <MetaRow label={t("cases.accused", locale)} value={String(data.accused.length)} />
          <MetaRow label={t("cases.victims", locale)} value={String(data.victims.length)} />
          <MetaRow
            label="Created"
            value={new Date(data.created_at).toLocaleDateString("en-IN")}
          />
        </div>
      </div>

      {/* Accused */}
      {data.accused.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Shield size={14} />
            {t("cases.accused", locale)}
          </h2>
          <div className="flex flex-col gap-2">
            {data.accused.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <Link
                  href={`/offenders/${a.id}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {a.name}
                </Link>
                <span className="text-muted-foreground text-xs">
                  {a.gender ?? ""}
                  {a.age ? ` · Age ${a.age}` : ""}
                  {a.role ? ` · ${a.role}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Victims */}
      {data.victims.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <User size={14} />
            {t("cases.victims", locale)}
          </h2>
          <div className="flex flex-col gap-2">
            {data.victims.map((v) => (
              <div key={v.id} className="flex items-center gap-3 text-sm">
                <span className="font-medium">{v.name ?? "—"}</span>
                <span className="text-muted-foreground text-xs">
                  {v.gender ?? ""}
                  {v.age ? ` · Age ${v.age}` : ""}
                  {v.injury_type ? ` · ${v.injury_type}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mini map */}
      {data.locations.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <MapPin size={14} />
            {t("cases.district", locale)}
          </h2>
          <MiniMap locations={data.locations} />
        </div>
      )}

      {/* Similar cases */}
      {similar.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            {t("cases.similar", locale)}
          </h2>
          <div className="flex flex-col gap-3">
            {similar.map((s) => (
              <div
                key={s.id}
                className="border-b border-border last:border-0 pb-3 last:pb-0"
              >
                <div className="flex items-center justify-between text-sm">
                  <Link
                    href={`/cases/${s.id}`}
                    className="font-mono font-medium hover:text-primary hover:underline"
                  >
                    {s.fir_number}
                  </Link>
                  <span className="text-muted-foreground text-xs">
                    {s.crime_type} · {s.district}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(s.similarity_score * 100).toFixed(0)}% match
                  </span>
                </div>
                {s.rationale && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {s.rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit trail */}
      {data.audit_trail.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            {t("cases.timeline", locale)}
          </h2>
          <AuditTimeline entries={data.audit_trail} />
        </div>
      )}
    </div>
  );
}
