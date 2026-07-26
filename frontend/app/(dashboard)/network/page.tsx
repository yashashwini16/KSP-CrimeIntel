"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "@/lib/api";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n";
import NetworkGraph, {
  type GraphResponse,
  type NodeData,
} from "@/components/network/NetworkGraph";
import NodePanel from "@/components/network/NodePanel";

// ── Local overlays ─────────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-20">
      <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-2.5 shadow-lg">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Loading graph…</span>
      </div>
    </div>
  );
}

function ErrorOverlay({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 z-20">
      <p className="text-sm text-destructive font-medium">
        Failed to load network graph.
      </p>
      <button
        onClick={onRetry}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function NetworkPage() {
  const { locale } = useLocale();

  const [data, setData] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get<GraphResponse>("/api/network/graph");
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header bar */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-card shrink-0">
        <h1 className="text-lg font-semibold">{t("network.title", locale)}</h1>

        <div className="ml-auto flex items-center gap-2">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("network.search", locale)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 rounded-md border border-input bg-background px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Node / edge counts */}
          <span className="text-xs text-muted-foreground">
            {data?.nodes.length ?? 0} nodes · {data?.edges.length ?? 0} edges
          </span>
        </div>
      </div>

      {/* Graph canvas + slide-in node panel — relative container */}
      <div className="relative flex-1 overflow-hidden">
        {loading && <LoadingOverlay />}
        {error && <ErrorOverlay onRetry={fetchData} />}

        {data && (
          <NetworkGraph
            data={data}
            searchTerm={searchTerm}
            onNodeSelect={setSelectedNode}
          />
        )}

        <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>
    </div>
  );
}
