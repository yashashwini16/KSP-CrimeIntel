"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ForecastChartProps {
  historical: Array<{ date: string; count: number; predicted: boolean }>;
  forecast: Array<{ date: string; count: number; predicted: boolean }>;
}

interface CombinedPoint {
  date: string;
  historicalCount?: number;
  forecastCount?: number;
}

const tooltipContentStyle = {
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: "6px",
  fontSize: "12px",
};

const axisTick = { fill: "#71717a", fontSize: 11 };
const axisLine = { stroke: "#3f3f46" };
const tickLine = { stroke: "#3f3f46" };

export default function ForecastChart({ historical, forecast }: ForecastChartProps) {
  // Build a map from date → point, splitting into two series.
  // The last historical date also seeds the forecastCount so the two lines connect.
  const pointMap = new Map<string, CombinedPoint>();

  for (const h of historical) {
    pointMap.set(h.date, {
      ...(pointMap.get(h.date) ?? { date: h.date }),
      historicalCount: h.count,
    });
  }

  for (const f of forecast) {
    pointMap.set(f.date, {
      ...(pointMap.get(f.date) ?? { date: f.date }),
      forecastCount: f.count,
    });
  }

  // Bridge: duplicate the last historical point into the forecast series so the
  // two line segments connect visually at the boundary.
  if (historical.length > 0) {
    const lastHist = historical[historical.length - 1];
    const existing = pointMap.get(lastHist.date) ?? { date: lastHist.date };
    pointMap.set(lastHist.date, { ...existing, forecastCount: lastHist.count });
  }

  const combinedData: CombinedPoint[] = [...pointMap.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="mb-3 text-sm font-medium text-muted-foreground">
        Crime Forecast
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => v.slice(5)}
            tick={axisTick}
            axisLine={axisLine}
            tickLine={tickLine}
          />
          <YAxis tick={axisTick} axisLine={axisLine} tickLine={tickLine} />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Line
            dataKey="historicalCount"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            name="Historical"
            connectNulls={false}
          />
          <Line
            dataKey="forecastCount"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            name="Predicted"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <svg width="24" height="4" aria-hidden="true">
            <line x1="0" y1="2" x2="24" y2="2" stroke="#6366f1" strokeWidth="2" />
          </svg>
          <span className="text-xs text-muted-foreground">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="24" height="4" aria-hidden="true">
            <line
              x1="0"
              y1="2"
              x2="24"
              y2="2"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          </svg>
          <span className="text-xs text-muted-foreground">Predicted</span>
        </div>
      </div>
    </div>
  );
}
