import os
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status

from models.database import get_db
from schemas.common import ForecastResponse
from services.prediction_service import PredictionService
from utils.catalyst_auth import get_current_user

router = APIRouter(prefix="/api", tags=["forecast"])


# ---------------------------------------------------------------------------
# Shared CRON_SECRET dependency (also used in alerts router)
# ---------------------------------------------------------------------------


def verify_cron_secret(x_cron_secret: Annotated[str | None, Header()] = None) -> None:
    """Validate X-Cron-Secret header against CRON_SECRET env var."""
    expected = os.environ.get("CRON_SECRET")
    if expected and x_cron_secret != expected:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing cron secret",
        )


@router.get("/forecast", response_model=ForecastResponse)
async def get_forecast(
    db: Annotated[object, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
    district: Annotated[str | None, Query()] = None,
    crime_type: Annotated[str | None, Query()] = None,
    language: Annotated[str, Query(pattern="^(en|kn)$")] = "en",
) -> ForecastResponse:
    service = PredictionService()
    cache_key = service.cache_key(district, crime_type)
    cached = await service.get_cached_forecast(cache_key)
    if cached:
        return ForecastResponse.model_validate(cached)

    result = await service.forecast(
        db,
        district=district,
        crime_type=crime_type,
        language=language,
    )
    response = result.as_response()
    await service.set_cached_forecast(cache_key, response.model_dump(mode="json"))
    return response


@router.post("/cron/refresh-forecast", dependencies=[Depends(verify_cron_secret)])
async def refresh_forecast(
    db: Annotated[object, Depends(get_db)],
) -> dict[str, int | str]:
    """Cron endpoint: recompute and cache all district x crime_type forecasts.
    Protected by X-Cron-Secret header (CRON_SECRET env var).
    """
    refreshed = await PredictionService().refresh_all_forecasts(db)
    return {"status": "ok", "refreshed": refreshed}
