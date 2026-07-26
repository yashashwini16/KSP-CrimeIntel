"use client";

import { Play, Pause } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n";

interface TimeSliderProps {
  minDate: string; // "YYYY-MM-DD" — earliest date in data
  maxDate: string; // "YYYY-MM-DD" — latest date in data
  value: string; // current cursor date "YYYY-MM-DD"
  onChange: (date: string) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

function dateToTimestamp(date: string): number {
  return new Date(date).getTime();
}

function timestampToDateString(ts: number): string {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function TimeSlider({
  minDate,
  maxDate,
  value,
  onChange,
  isPlaying,
  onPlayPause,
}: TimeSliderProps) {
  const { locale } = useLocale();

  const minTs = dateToTimestamp(minDate);
  const maxTs = dateToTimestamp(maxDate);
  const valueTs = dateToTimestamp(value);

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const ts = Number(e.target.value);
    onChange(timestampToDateString(ts));
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-3 shadow-lg">
      {/* Play / Pause */}
      <button
        onClick={onPlayPause}
        aria-label={isPlaying ? t("map.pause", locale) : t("map.play", locale)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>

      {/* Range slider */}
      <input
        type="range"
        min={minTs}
        max={maxTs}
        value={valueTs}
        step={24 * 60 * 60 * 1000} // 1 day in ms
        onChange={handleSliderChange}
        className="w-full accent-white"
      />

      {/* Current date label */}
      <span className="shrink-0 text-xs tabular-nums text-white/80">
        {value}
      </span>
    </div>
  );
}
