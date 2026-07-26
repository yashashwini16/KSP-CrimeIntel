"""
Alerts route — NoSQL edition.
All SQLAlchemy queries replaced with Catalyst document operations.
"""

import logging
import os
from datetime import date, datetime, timezone
from math import ceil
from typing import Annotated, Any

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status

from models.database import get_db
from models.nosql_models import Alert
from schemas.common import AlertSchema, PaginatedResponse
from utils.catalyst_auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["alerts"])
ws_router = APIRouter(tags=["alerts"])

HIGH_SEVERITY_CRIME_TYPES: frozenset[str] = frozenset(
    {"murder", "kidnapping", "robbery", "assault"}
)


# ---------------------------------------------------------------------------
# Cron secret validation
# ---------------------------------------------------------------------------

def verify_cron_secret(x_cron_secret: Annotated[str | None, Header()] = None) -> None:
    expected = os.environ.get("CRON_SECRET")
    if expected and x_cron_secret != expected:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing cron secret",
        )


# ---------------------------------------------------------------------------
# Catalyst Signals publisher
# ---------------------------------------------------------------------------

async def publish_to_signals(payload: dict[str, Any]) -> None:
    endpoint = os.environ.get("CATALYST_SIGNALS_ENDPOINT")
    if not endpoint:
        return
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(endpoint, json=payload)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to publish alert to Catalyst Signals: %s", exc)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/alerts", response_model=PaginatedResponse[AlertSchema])
async def list_alerts(
    db: Annotated[object, Depends(get_db)],
    _current_user: Annotated[Any, Depends(get_current_user)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    severity: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> PaginatedResponse[AlertSchema]:
    all_alerts = await Alert.get_all(severity=severity, limit=500)

    # Date filter in-memory (Catalyst CREATEDTIME is not directly filterable via ZCQL)
    if date_from or date_to:
        filtered: list[Alert] = []
        for a in all_alerts:
            # Use the auto CREATEDTIME field from Catalyst if present
            ts_raw = a.model_extra.get("CREATEDTIME") if hasattr(a, "model_extra") else None
            if ts_raw:
                try:
                    ts = datetime.fromisoformat(str(ts_raw).replace("Z", "+00:00"))
                    d = ts.date()
                    if date_from and d < date_from:
                        continue
                    if date_to and d > date_to:
                        continue
                except Exception:
                    pass
            filtered.append(a)
        all_alerts = filtered

    total = len(all_alerts)
    start = (page - 1) * page_size
    page_items = all_alerts[start: start + page_size]

    items = [
        AlertSchema(
            id=str(a.ROWID),
            title=a.title,
            severity=a.severity,
            fir_id=a.case_id,
            is_read=a.is_read,
            created_at=None,
        )
        for a in page_items
    ]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=ceil(total / page_size) if total else 0,
    )


@router.patch("/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    db: Annotated[object, Depends(get_db)],
    _current_user: Annotated[Any, Depends(get_current_user)],
) -> dict[str, str]:
    from models.database import get_catalyst_db, Collections
    catalyst_db = get_catalyst_db()
    doc = await catalyst_db.get_document(Collections.ALERTS, alert_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    await catalyst_db.update_document(Collections.ALERTS, alert_id, {"is_read": True})
    return {"status": "ok"}


@ws_router.get("/ws/alerts")
async def ws_alerts_stub() -> dict[str, str]:
    signals_endpoint = os.environ.get(
        "CATALYST_SIGNALS_ENDPOINT", "https://signals.catalyst.zoho.com"
    )
    return {
        "message": (
            "Real-time alerts are delivered via Catalyst Signals. "
            "Subscribe to the Signals event bus to receive alert notifications."
        ),
        "signals_endpoint": signals_endpoint,
        "docs": "https://catalyst.zoho.com/help/signals.html",
    }


@router.post("/cron/generate-alerts", dependencies=[Depends(verify_cron_secret)])
async def generate_alerts(
    db: Annotated[object, Depends(get_db)],
) -> dict[str, Any]:
    from models.nosql_models import Case
    all_cases = await Case.get_all(limit=200)

    created_count = 0
    for c in all_cases:
        crime_name = c.crime_type.get("name", "").lower()
        if crime_name not in HIGH_SEVERITY_CRIME_TYPES:
            continue

        # Check if alert already exists for this case
        existing = await Alert.get_all(limit=500)
        already_alerted = any(a.case_id == c.ROWID for a in existing)
        if already_alerted:
            continue

        severity = _crime_to_severity(crime_name)
        district = c.district.get("name", "Unknown")
        alert = await Alert.create(
            title=f"High-severity Case: {c.crime_type.get('name','Unknown')} — {district}",
            severity=severity,
            case_id=c.ROWID,
        )

        await publish_to_signals(
            {
                "id": alert.ROWID,
                "title": alert.title,
                "severity": alert.severity,
                "case_id": alert.case_id,
                "is_read": alert.is_read,
            }
        )
        created_count += 1

    return {"status": "ok", "alerts_created": created_count}


# ---------------------------------------------------------------------------
# Pure helpers
# ---------------------------------------------------------------------------

def _crime_to_severity(crime_type: str) -> str:
    ct = crime_type.lower()
    if ct in {"murder", "kidnapping"}:
        return "critical"
    return "high"
