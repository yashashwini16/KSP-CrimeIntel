"""
Analytics service — NoSQL edition.
No SQL GROUP BY available; all aggregations are done in Python over
Catalyst document collections.
"""

from collections import defaultdict
from datetime import date
from typing import Any

from models.nosql_models import Case
from schemas.analytics import AnalyticsSummary, TimeSeriesPoint


class AnalyticsService:

    async def get_summary(
        self,
        db: Any,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> AnalyticsSummary:
        # Fetch all cases (up to 2000) and filter in Python
        all_cases = await Case.get_all(limit=2000)
        cases = _filter_by_date(all_cases, date_from, date_to)

        total_cases = len(cases)
        open_cases = sum(1 for c in cases if c.case_status.get("name", "").lower() == "open")
        closed_cases = sum(1 for c in cases if c.case_status.get("name", "").lower() == "closed")

        # cases by crime type
        by_type: defaultdict[str, int] = defaultdict(int)
        for c in cases:
            by_type[c.crime_type.get("name", "Unknown")] += 1

        # cases by district
        by_district: defaultdict[str, int] = defaultdict(int)
        for c in cases:
            by_district[c.district.get("name", "Unknown")] += 1

        # victim demographics — aggregate across embedded victims
        victim_demo: defaultdict[str, int] = defaultdict(int)
        for c in cases:
            for v in c.victims:
                gender = v.get("gender", "Unknown")
                victim_demo[f"Gender_{gender}"] += 1

        # monthly crime trend
        monthly: defaultdict[str, int] = defaultdict(int)
        for c in cases:
            d = c.CrimeRegisteredDate
            if d:
                month_key = d.strftime("%Y-%m")
                monthly[month_key] += 1

        crime_trend = [
            TimeSeriesPoint(
                date=date.fromisoformat(f"{k}-01"),
                count=v,
                label=k,
            )
            for k, v in sorted(monthly.items())
        ]

        return AnalyticsSummary(
            total_cases=total_cases,
            open_cases=open_cases,
            closed_cases=closed_cases,
            cases_by_type=dict(by_type),
            cases_by_district=dict(by_district),
            victim_demographics=dict(victim_demo),
            modus_operandi_frequency={},
            crime_trend=crime_trend,
        )

    @staticmethod
    def filter_firs_by_date(
        firs: list[Any], date_from: date | None = None, date_to: date | None = None
    ) -> list[Any]:
        return _filter_by_date(firs, date_from, date_to)


def _filter_by_date(cases: list[Case], date_from: date | None, date_to: date | None) -> list[Case]:
    if not date_from and not date_to:
        return cases
    filtered = []
    for c in cases:
        d = c.CrimeRegisteredDate
        if d is None:
            filtered.append(c)
            continue
        if date_from and d < date_from:
            continue
        if date_to and d > date_to:
            continue
        filtered.append(c)
    return filtered
