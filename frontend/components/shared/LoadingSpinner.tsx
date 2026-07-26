"use client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoadingSpinnerProps {
  /** Text shown next to the spinner. */
  label?: string;
  /** Full-page centred layout (default true). */
  fullPage?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoadingSpinner({
  label = "Loading…",
  fullPage = true,
}: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="flex items-center justify-center p-16 text-sm text-muted-foreground gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {label}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      {label}
    </div>
  );
}
