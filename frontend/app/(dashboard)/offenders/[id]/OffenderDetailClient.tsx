"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, MapPin } from "lucide-react";
import type { AxiosError } from "axios";
import api from "@/lib/api";
import { t, useLocale } from "@/lib/i18n";
import RiskGauge, { sortFIRsDescending } from "@/components/offenders/RiskGauge";
import NetworkGraph, {
  type GraphResponse,
  type NodeData,
} from "@/components/network/NetworkGraph";
import ExportButton from "@/components/shared/ExportButton";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

// ─── API types ────────────────────────────────────────────────────────────────

interface FIRBrief {
  id: number;
  fir_number: string;
  date: string;
  crime_type: string;
  district: string;
  status: string;
}

interface CriminalLink {
  id: number;
  linked_accused_id: number;
  linked_accused_name: string;
  link_type: string;
  weight: number;
}

interface OffenderDetail {
  id: number;
  name: string;
  age?: number | null;
  gender?: string | null;
  address?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  created_at: string;
  risk_score: number;
  firs: FIRBrief[];
  links: CriminalLink[];
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

function PhotoPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-border text-xl font-semibold text-muted-foreground">
      {initials}
    </div>
  );
}

// ─── Mini NetworkGraph wrapper ───────────────────────────────────────────────

function MiniCriminalGraph({ links, offenderId }: { links: CriminalLink[]; offenderId: number }) {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  const graphData: GraphResponse = useMemo(() => {
    const nodes: GraphResponse["nodes"] = [
      {
        id: String(offenderId),
        label: "Self",
        type: "accused",
        community_id: null,
        risk_score: null,
        metadata: {},
      },
      ...links.map((l) => ({
        id: String(l.linked_accused_id),
        label: l.linked_accused_name,
        type: "accused",
        community_id: null,
        risk_score: null,
        metadata: { link_type: l.link_type, weight: l.weight },
      })),
    ];

    const edges: GraphResponse["edges"] = links.map((l) => ({
      id: String(l.id),
      source: String(offenderId),
      target: String(l.linked_accused_id),
      link_type: l.link_type,
      weight: l.weight,
      directed: false,
      metadata: {},
    }));

    return { nodes, edges };
  }, [links, offenderId]);

  return (
    <div className="relative h-[300px] rounded-lg overflow-hidden border border-border">
      <NetworkGraph
        data={graphData}
        searchTerm=""
        onNodeSelect={setSelectedNode}
      />
      {selectedNode && (
        <div className="absolute bottom-2 left-2 right-2 rounded-md bg-card border border-border px-3 py-2 text-xs shadow-lg">
          <span className="font-medium">{selectedNode.label}</span>
          {selectedNode.id !== String(offenderId) && (
            <Link
              href={`/offenders/${selectedNode.id}`}
              className="ml-2 text-primary hover:underline"
            >
              View profile →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────────

export default function OffenderDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useLocale();
  const id = String(params.id);

  const [data, setData] = useState<OffenderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<OffenderDetail>(`/api/offenders/${id}`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = (err as AxiosError)?.response?.status;
        if (status === 404) {
          router.replace("/offenders");
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
    <div className="flex flex-col gap-6 p-6 max-w-3xl">
      {/* Back */}
      <Link
        href="/offenders"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft size={14} />
        {t("common.back", locale)}
      </Link>

      {/* Header with photo + risk gauge */}
      <div className="flex items-start gap-6">
        <PhotoPlaceholder name={data.name} />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold">{data.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.gender ?? t("common.unknown", locale)} ·{" "}
            {t("offenders.age", locale)} {data.age ?? "—"} · {data.firs.length}{" "}
            FIRs
          </p>
          {data.phone && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Phone size={12} />
              {data.phone}
            </p>
          )}
          {data.address && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <MapPin size={12} />
              {data.address}
            </p>
          )}
        </div>
        <RiskGauge score={data.risk_score} />
        <ExportButton
          endpoint={`/api/export/offender/${id}`}
          label={t("offenders.export", locale)}
        />
      </div>

      {/* FIR history */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
          {t("offenders.fir_history", locale)}
        </h2>
        {data.firs.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <div className="rounded-md border border-border overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 bg-zinc-900/50 border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>{t("cases.date", locale)}</span>
              <span>{t("cases.fir_number", locale)}</span>
              <span>{t("cases.crime_type", locale)} · {t("cases.district", locale)}</span>
              <span>{t("cases.status", locale)}</span>
            </div>
            {/* Table rows */}
            {sortFIRsDescending(data.firs).map((f) => (
              <div
                key={f.id}
                className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 border-b border-border last:border-0 px-4 py-3 text-sm hover:bg-accent/30 transition-colors"
              >
                <span className="font-mono text-muted-foreground text-xs">
                  {f.date}
                </span>
                <span className="font-medium">
                  <Link
                    href={`/cases/${f.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {f.fir_number}
                  </Link>
                </span>
                <span className="text-muted-foreground capitalize">
                  {f.crime_type} · {f.district}
                </span>
                <StatusBadge status={f.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Criminal links — mini D3 graph */}
      {data.links.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
            {t("offenders.links", locale)}
          </h2>
          <MiniCriminalGraph links={data.links} offenderId={data.id} />
        </div>
      )}
    </div>
  );
}
