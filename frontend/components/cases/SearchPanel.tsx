"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface SearchFilters {
  keyword: string;
  crimeType: string;
  district: string;
  dateFrom: string;
  dateTo: string;
}

interface SearchPanelProps extends SearchFilters {
  onChange: (filters: SearchFilters) => void;
}

const inputClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full";

export default function SearchPanel(props: SearchPanelProps) {
  const [keyword, setKeyword] = useState(props.keyword);
  const [crimeType, setCrimeType] = useState(props.crimeType);
  const [district, setDistrict] = useState(props.district);
  const [dateFrom, setDateFrom] = useState(props.dateFrom);
  const [dateTo, setDateTo] = useState(props.dateTo);

  function apply() {
    props.onChange({ keyword, crimeType, district, dateFrom, dateTo });
  }

  function reset() {
    setKeyword("");
    setCrimeType("");
    setDistrict("");
    setDateFrom("");
    setDateTo("");
    props.onChange({
      keyword: "",
      crimeType: "",
      district: "",
      dateFrom: "",
      dateTo: "",
    });
  }

  return (
    <div className="flex flex-wrap gap-3 items-end rounded-lg border border-border bg-card p-4">
      {/* Keyword */}
      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            className={`${inputClass} pl-8`}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="FIR number, keyword…"
          />
        </div>
      </div>

      {/* Crime type */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
          Crime Type
        </label>
        <input
          type="text"
          className={inputClass}
          value={crimeType}
          onChange={(e) => setCrimeType(e.target.value)}
          placeholder="e.g. theft"
        />
      </div>

      {/* District */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
          District
        </label>
        <input
          type="text"
          className={inputClass}
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="e.g. Bengaluru"
        />
      </div>

      {/* Date from */}
      <div className="flex flex-col gap-1 min-w-[130px]">
        <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
          From
        </label>
        <input
          type="date"
          className={inputClass}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </div>

      {/* Date to */}
      <div className="flex flex-col gap-1 min-w-[130px]">
        <label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
          To
        </label>
        <input
          type="date"
          className={inputClass}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={apply}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Apply
        </button>
        <button
          onClick={reset}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
