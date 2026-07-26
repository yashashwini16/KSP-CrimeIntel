"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n";

interface FilterPanelProps {
  crimeType: string;
  district: string;
  dateFrom: string;
  dateTo: string;
  onChange: (filters: {
    crimeType: string;
    district: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
}

export default function FilterPanel({
  crimeType,
  district,
  dateFrom,
  dateTo,
  onChange,
}: FilterPanelProps) {
  const { locale } = useLocale();

  const [localCrimeType, setLocalCrimeType] = useState(crimeType);
  const [localDistrict, setLocalDistrict] = useState(district);
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom);
  const [localDateTo, setLocalDateTo] = useState(dateTo);

  function handleApply() {
    onChange({
      crimeType: localCrimeType,
      district: localDistrict,
      dateFrom: localDateFrom,
      dateTo: localDateTo,
    });
  }

  function handleReset() {
    setLocalCrimeType("");
    setLocalDistrict("");
    setLocalDateFrom("");
    setLocalDateTo("");
    onChange({ crimeType: "", district: "", dateFrom: "", dateTo: "" });
  }

  const inputClass =
    "w-full rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30";

  return (
    <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-4 shadow-lg">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/70">
        {t("map.filter_title", locale)}
      </p>

      <div className="space-y-2.5">
        {/* Crime type */}
        <div>
          <label className="mb-1 block text-xs text-white/60">
            {t("cases.crime_type", locale)}
          </label>
          <input
            type="text"
            value={localCrimeType}
            onChange={(e) => setLocalCrimeType(e.target.value)}
            placeholder="e.g. Theft"
            className={inputClass}
          />
        </div>

        {/* District */}
        <div>
          <label className="mb-1 block text-xs text-white/60">
            {t("cases.district", locale)}
          </label>
          <input
            type="text"
            value={localDistrict}
            onChange={(e) => setLocalDistrict(e.target.value)}
            placeholder="e.g. Bengaluru"
            className={inputClass}
          />
        </div>

        {/* Date from */}
        <div>
          <label className="mb-1 block text-xs text-white/60">
            {t("common.date_from", locale)}
          </label>
          <input
            type="date"
            value={localDateFrom}
            onChange={(e) => setLocalDateFrom(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Date to */}
        <div>
          <label className="mb-1 block text-xs text-white/60">
            {t("common.date_to", locale)}
          </label>
          <input
            type="date"
            value={localDateTo}
            onChange={(e) => setLocalDateTo(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleApply}
          className="rounded-md bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 transition-colors"
        >
          {t("common.apply", locale)}
        </button>
        <button
          onClick={handleReset}
          className="rounded-md px-3 py-1.5 text-xs text-white/60 hover:text-white transition-colors"
        >
          {t("common.reset", locale)}
        </button>
      </div>
    </div>
  );
}
