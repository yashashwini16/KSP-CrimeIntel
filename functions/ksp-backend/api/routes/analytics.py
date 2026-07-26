from datetime import date
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query

from models.database import get_db
from schemas.analytics import AnalyticsSummary
from services.analytics_service import AnalyticsService
from utils.catalyst_auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    db: Annotated[object, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
    date_from: Annotated[date | None, Query()] = None,
    date_to: Annotated[date | None, Query()] = None,
) -> AnalyticsSummary:
    return await AnalyticsService().get_summary(db, date_from=date_from, date_to=date_to)
