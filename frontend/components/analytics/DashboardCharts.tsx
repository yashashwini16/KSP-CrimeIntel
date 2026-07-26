"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsSummary {
  total_cases: number;
  open_cases: number;
  closed_cases: number;
  cases_by_type: Record<string, number>;
  cases_by_district: Record<string, number>;
  victim_demographics: Record<string, number>;
  modus_operandi_frequency: Record<string, number>;
  crime_trend: Array<{ date: string; count: number; label?: string }>;
}

interface DashboardChartsProps {
  data: AnalyticsSummary;
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

function sortedEntries(
  record: Record<string, number>,
  limit: number,
): Array<{ name: string; value: number }> {
  return Object.entries(record)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const trendData = data.crime_trend;
  const byTypeData = sortedEntries(data.cases_by_type, 8);
  const byDistrictData = sortedEntries(data.cases_by_district, 8);
  const demographicsData = sortedEntries(data.victim_demographics, 8);
  const modusData = sortedEntries(data.modus_operandi_frequency, 6);

  const cards: Array<{ title: string; height: number; content: React.ReactNode }> = [
    {
      title: "Crime Trend",
      height: 240,
      content: (
        <LineChart data={trendData}>
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
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      ),
    },
    {
      title: "By Crime Type",
      height: 240,
      content: (
        <BarChart data={byTypeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="name" tick={axisTick} axisLine={axisLine} tickLine={tickLine} />
          <YAxis tick={axisTick} axisLine={axisLine} tickLine={tickLine} />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0] as [number, number, number, number]} />
        </BarChart>
      ),
    },
    {
      title: "By District",
      height: 240,
      content: (
        <BarChart data={byDistrictData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="name" tick={axisTick} axisLine={axisLine} tickLine={tickLine} />
          <YAxis tick={axisTick} axisLine={axisLine} tickLine={tickLine} />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0] as [number, number, number, number]} />
        </BarChart>
      ),
    },
    {
      title: "Victim Demographics",
      height: 240,
      content: (
        <BarChart data={demographicsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="name" tick={axisTick} axisLine={axisLine} tickLine={tickLine} />
          <YAxis tick={axisTick} axisLine={axisLine} tickLine={tickLine} />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0] as [number, number, number, number]} />
        </BarChart>
      ),
    },
    {
      title: "Modus Operandi",
      height: 200,
      content: (
        <BarChart data={modusData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <YAxis
            type="category"
            dataKey="name"
            tick={axisTick}
            axisLine={axisLine}
            tickLine={tickLine}
            width={100}
          />
          <XAxis type="number" tick={axisTick} axisLine={axisLine} tickLine={tickLine} />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0] as [number, number, number, number]} />
        </BarChart>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {cards.map(({ title, height, content }, index) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.08 }}
          className="rounded-lg border border-border bg-card p-5"
        >
          <p className="mb-3 text-sm font-medium text-muted-foreground">{title}</p>
          <ResponsiveContainer width="100%" height={height}>
            {content as React.ReactElement}
          </ResponsiveContainer>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
