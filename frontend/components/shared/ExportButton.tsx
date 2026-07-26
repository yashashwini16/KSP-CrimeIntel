"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import type { AxiosError } from "axios";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExportButtonProps {
  /** API endpoint to call (e.g. "/api/export/case/123"). */
  endpoint: string;
  /** Button label text. */
  label?: string;
  /** Additional CSS classes. */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExportButton({
  endpoint,
  label = "Export PDF",
  className,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ url: string }>(endpoint);
      window.open(res.data.url, "_blank");
    } catch (err: unknown) {
      const msg =
        (err as AxiosError<{ detail?: string }>)?.response?.data?.detail ??
        "Export failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={
          className ??
          "flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        }
      >
        {loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <FileDown size={14} />
        )}
        {label}
      </button>
      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}
