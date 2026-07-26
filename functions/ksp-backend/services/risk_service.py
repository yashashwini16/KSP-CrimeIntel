"""Risk scoring service — NoSQL edition. Computes risk from embedded case data."""

from datetime import date
from typing import Any


class RiskService:
    async def compute_risk_score(self, offender_id: str, db: Any) -> int:
        """
        Compute risk score for an offender using their embedded accused record.
        offender_id format: "{case_rowid}__{index}"
        """
        from models.nosql_models import Case

        if "__" not in str(offender_id):
            return 0

        case_rowid, _, idx_str = str(offender_id).partition("__")
        case = await Case.get_by_id(case_rowid)
        if case is None:
            return 0

        try:
            accused = case.accused_persons[int(idx_str)]
        except (ValueError, IndexError):
            return 0

        # Use stored risk_score if available
        stored = accused.get("risk_score")
        if stored is not None:
            return max(0, min(100, int(stored)))

        # Fallback: compute from case data
        accused_name = accused.get("name", "")
        all_cases = await Case.get_all(limit=500)
        matching_cases = [
            c for c in all_cases
            if any(a.get("name") == accused_name for a in c.accused_persons)
        ]

        prior_fir_count = len(matching_cases)
        last_date = None
        for c in matching_cases:
            d = c.CrimeRegisteredDate
            if d and (last_date is None or d > last_date):
                last_date = d

        return self.compute_from_factors(
            prior_fir_count=prior_fir_count,
            last_fir_date=last_date,
            severity_points=20,
            centrality=0,
        )

    @staticmethod
    def compute_from_factors(
        prior_fir_count: int,
        last_fir_date: date | None = None,
        severity_points: int = 0,
        centrality: int = 0,
    ) -> int:
        raw_score = (
            min(max(prior_fir_count, 0) * 12, 35)
            + RiskService._recency_points(last_fir_date)
            + min(max(severity_points, 0), 35)
            + min(max(centrality, 0) * 4, 15)
        )
        return max(0, min(100, int(round(raw_score))))

    @staticmethod
    def _recency_points(last_fir_date: date | None) -> int:
        if last_fir_date is None:
            return 0
        age_days = (date.today() - last_fir_date).days
        if age_days <= 30:
            return 15
        if age_days <= 180:
            return 10
        if age_days <= 365:
            return 5
        return 0
