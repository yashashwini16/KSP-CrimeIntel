"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { communityColour, type NodeData } from "./NetworkGraph";

// ── Helpers ────────────────────────────────────────────────────────────────

function riskBarColour(s: number): string {
  return s >= 67 ? "#ef4444" : s >= 34 ? "#f59e0b" : "#22c55e";
}

// ── Props ──────────────────────────────────────────────────────────────────

interface NodePanelProps {
  node: NodeData | null;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function NodePanel({ node, onClose }: NodePanelProps) {
  return (
    <div
      className={cn(
        "absolute right-0 top-0 h-full w-72 border-l border-border bg-card shadow-xl transition-transform duration-200 z-10 flex flex-col",
        node ? "translate-x-0" : "translate-x-full",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-sm font-semibold">{node?.label ?? ""}</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      {node && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Risk score */}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Risk Score
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                <div
                  style={{
                    width: `${node.risk_score ?? 0}%`,
                    background: riskBarColour(node.risk_score ?? 0),
                  }}
                  className="h-full rounded-full transition-all"
                />
              </div>
              <span className="text-sm font-medium">
                {node.risk_score ?? "—"}
              </span>
            </div>
          </div>

          {/* Community */}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Community
            </p>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ background: communityColour(node.community_id) }}
              />
              <span className="text-sm">
                {node.community_id != null
                  ? `Group ${node.community_id}`
                  : "Unknown"}
              </span>
            </div>
          </div>

          {/* Node type */}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Type
            </p>
            <p className="text-sm capitalize">{node.type}</p>
          </div>

          {/* ID */}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Node ID
            </p>
            <p className="text-sm font-mono text-muted-foreground break-all">
              {node.id}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
