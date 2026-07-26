from datetime import date

from pydantic import BaseModel


class TimeSeriesPoint(BaseModel):
    date: date
    count: int
    label: str | None = None


class AnalyticsSummary(BaseModel):
    total_cases: int
    open_cases: int
    closed_cases: int
    cases_by_type: dict[str, int]
    cases_by_district: dict[str, int]
    victim_demographics: dict[str, int]
    modus_operandi_frequency: dict[str, int]
    crime_trend: list[TimeSeriesPoint]
