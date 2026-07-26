"use client";

interface ForecastSummaryProps {
  summary: string;
}

export default function ForecastSummary({ summary }: ForecastSummaryProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
        AI Summary
      </p>
      <p className="text-sm leading-6 text-foreground whitespace-pre-wrap">
        {summary}
      </p>
    </div>
  );
}
