"use client";

// ─── Pure helpers (imported by property tests) ────────────────────────────────

/** Returns the hex colour for a risk score 0-100. */
export function riskColour(score: number): string {
  if (score >= 67) return "#ef4444"; // red
  if (score >= 34) return "#f59e0b"; // amber
  return "#22c55e"; // green
}

/** Returns the human-readable risk band label for a score 0-100. */
export function riskBandLabel(score: number): string {
  if (score >= 67) return "High Risk";
  if (score >= 34) return "Medium Risk";
  return "Low Risk";
}

/** Sort FIR briefs newest-first (descending). Does not mutate the input. */
export function sortFIRsDescending<T extends { date: string }>(firs: T[]): T[] {
  return [...firs].sort((a, b) => b.date.localeCompare(a.date));
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RiskGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export default function RiskGauge({ score, size = 120, showLabel = true }: RiskGaugeProps) {
  const cx = 60;
  const cy = 60;
  const r = 50;

  // Background: full top semi-circle left → right
  const bg = `M 10 60 A 50 50 0 0 1 110 60`;

  // Foreground: sweep from left (0%) to score% along the same semi-circle
  const angle = Math.PI * (score / 100);
  const ex = cx - r * Math.cos(angle);
  const ey = cy - r * Math.sin(angle);
  const fg =
    score > 0
      ? `M 10 60 A 50 50 0 ${score > 50 ? 1 : 0} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`
      : "";

  const colour = riskColour(score);
  const label = riskBandLabel(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={Math.round(size * (70 / 120))}
        viewBox="0 0 120 70"
        fill="none"
        overflow="visible"
      >
        {/* Background arc */}
        <path
          d={bg}
          stroke="#27272a"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        {fg && (
          <path
            d={fg}
            stroke={colour}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </svg>
      <p className="text-center text-2xl font-bold">{score}</p>
      <p className="text-center text-xs text-muted-foreground">/ 100</p>
      {showLabel && (
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${colour}20`, color: colour }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
