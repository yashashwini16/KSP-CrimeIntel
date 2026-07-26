"""Prediction / forecast service — NoSQL edition. Aggregates monthly counts in Python."""

import os
from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from typing import Any

import httpx
import numpy as np
from sklearn.linear_model import LinearRegression

from models.nosql_models import Case
from schemas.common import ForecastPoint, ForecastResponse
from services.translation_service import TranslationService


@dataclass
class ForecastResult:
    historical: list[ForecastPoint]
    forecast: list[ForecastPoint]
    summary: str

    def as_response(self) -> ForecastResponse:
        return ForecastResponse(
            historical=self.historical,
            forecast=self.forecast,
            summary=self.summary,
        )


class PredictionService:
    def __init__(
        self,
        quickml_endpoint: str | None = None,
        cache_endpoint: str | None = None,
        translation_service: TranslationService | None = None,
    ) -> None:
        self.quickml_endpoint = quickml_endpoint or os.environ.get("QUICKML_ENDPOINT")
        self.cache_endpoint = cache_endpoint or os.environ.get("CATALYST_CACHE_ENDPOINT")
        self.translation_service = translation_service or TranslationService()

    async def forecast(
        self,
        db: Any,
        district: str | None = None,
        crime_type: str | None = None,
        language: str = "en",
    ) -> ForecastResult:
        rows = await self._monthly_counts(db, district, crime_type)
        historical = [
            ForecastPoint(
                date=month,
                district=district or "All",
                crime_type=crime_type or "All",
                count=count,
                predicted=False,
            )
            for month, count in rows
        ]
        predicted_counts = self.predict_next_three([count for _month, count in rows])
        start_month = rows[-1][0] if rows else date.today().replace(day=1)
        forecast_points = [
            ForecastPoint(
                date=self._add_months(start_month, idx),
                district=district or "All",
                crime_type=crime_type or "All",
                count=max(0, int(round(value))),
                predicted=True,
            )
            for idx, value in enumerate(predicted_counts, start=1)
        ]
        summary = await self._summary(historical, forecast_points)
        summary = self._cap_words(summary, 300)
        if language.lower() == "kn":
            summary = await self.translation_service.translate_to_kannada(summary)
        return ForecastResult(historical=historical, forecast=forecast_points, summary=summary)

    def predict_next_three(self, counts: list[int]) -> list[float]:
        if not counts:
            return [0.0, 0.0, 0.0]
        if len(counts) == 1:
            return [float(counts[0])] * 3
        x = np.arange(len(counts), dtype=float).reshape(-1, 1)
        y = np.array(counts, dtype=float)
        model = LinearRegression().fit(x, y)
        future_x = np.arange(len(counts), len(counts) + 3, dtype=float).reshape(-1, 1)
        predicted = [float(v) for v in model.predict(future_x)]
        return predicted

    async def get_cached_forecast(self, key: str) -> dict[str, Any] | None:
        if not self.cache_endpoint:
            return None
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(f"{self.cache_endpoint.rstrip('/')}/{key}")
                if response.status_code == 404:
                    return None
                response.raise_for_status()
                data = response.json()
                return data if isinstance(data, dict) else None
        except Exception:  # noqa: BLE001
            return None

    async def set_cached_forecast(self, key: str, value: dict[str, Any]) -> None:
        if not self.cache_endpoint:
            return
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                await client.put(
                    f"{self.cache_endpoint.rstrip('/')}/{key}", json=value
                )
        except Exception:  # noqa: BLE001
            return

    async def refresh_all_forecasts(self, db: Any) -> int:
        # In-memory: collect distinct district+crime_type combos
        cases = await Case.get_all(limit=1000)
        combos: set[tuple[str | None, str | None]] = set()
        for c in cases:
            d = c.district.get("name") or None
            ct = c.crime_type.get("name") or None
            combos.add((d, ct))

        for district, crime_type in combos:
            result = await self.forecast(db, district=district, crime_type=crime_type)
            await self.set_cached_forecast(
                self.cache_key(district, crime_type),
                result.as_response().model_dump(mode="json"),
            )
        return len(combos)

    @staticmethod
    def cache_key(district: str | None, crime_type: str | None) -> str:
        d_key = (district or "all").lower().replace(" ", "-")
        c_key = (crime_type or "all").lower().replace(" ", "-")
        return f"forecast:{d_key}:{c_key}"

    async def _monthly_counts(
        self, db: Any, district: str | None, crime_type: str | None
    ) -> list[tuple[date, int]]:
        """Fetch cases and aggregate monthly counts in Python."""
        cases = await Case.get_all(limit=1000)

        monthly: defaultdict[str, int] = defaultdict(int)
        for c in cases:
            if district and c.district.get("name") != district:
                continue
            if crime_type and c.crime_type.get("name") != crime_type:
                continue
            d = c.CrimeRegisteredDate
            if d:
                key = d.strftime("%Y-%m")
                monthly[key] += 1

        return [
            (date.fromisoformat(f"{k}-01"), count)
            for k, count in sorted(monthly.items())
        ][-12:]  # last 12 months

    async def _summary(
        self, historical: list[ForecastPoint], forecast: list[ForecastPoint]
    ) -> str:
        fallback = (
            "Forecast generated from monthly case counts. "
            f"Historical months: {len(historical)}. "
            f"Predicted counts: {', '.join(str(p.count) for p in forecast)}."
        )
        if not self.quickml_endpoint:
            return fallback
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.quickml_endpoint,
                    json={
                        "task": "forecast_summary",
                        "max_words": 300,
                        "historical": [p.model_dump(mode="json") for p in historical],
                        "forecast": [p.model_dump(mode="json") for p in forecast],
                    },
                )
                response.raise_for_status()
                data = response.json()
                return str(data.get("summary") or data.get("text") or fallback)
        except Exception:  # noqa: BLE001
            return fallback

    @staticmethod
    def _cap_words(text: str, limit: int) -> str:
        words = text.split()
        return text if len(words) <= limit else " ".join(words[:limit])

    @staticmethod
    def _add_months(month: date, offset: int) -> date:
        year = month.year + (month.month - 1 + offset) // 12
        next_month = (month.month - 1 + offset) % 12 + 1
        return date(year, next_month, 1)
