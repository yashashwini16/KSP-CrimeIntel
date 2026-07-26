"""
Audit log route — NoSQL edition.
Queries the Catalyst 'audit_logs' collection with in-memory date filtering.
"""

from datetime import date, datetime
from math import ceil
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query

from models.database import get_db
from models.nosql_models import AuditLog
from schemas.common import AuditLogSchema, PaginatedResponse
from utils.catalyst_auth import get_current_user

router = APIRouter(prefix="/api", tags=["audit"])


@router.get("/audit-logs", response_model=PaginatedResponse[AuditLogSchema])
async def list_audit_logs(
    db: Annotated[object, Depends(get_db)],
    _current_user: Annotated[Any, Depends(get_current_user)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    user_id: str | None = None,
    action_type: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> PaginatedResponse[AuditLogSchema]:
    logs = await AuditLog.get_all(user_id=user_id, action_type=action_type, limit=1000)

    # In-memory date filter
    filtered = filter_audit_records(
        [_log_to_dict(l) for l in logs],
        user_id=user_id,
        action_type=action_type,
        date_from=date_from,
        date_to=date_to,
    )

    total = len(filtered)
    start = (page - 1) * page_size
    page_items = filtered[start: start + page_size]

    items = [
        AuditLogSchema(
            id=r["id"],
            user_id=r["user_id"],
            action_type=r["action_type"],
            resource_type=r.get("resource_type"),
            resource_id=r.get("resource_id"),
            timestamp=r.get("timestamp"),
            ip_address=r.get("ip_address"),
        )
        for r in page_items
    ]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=ceil(total / page_size) if total else 0,
    )


# ---------------------------------------------------------------------------
# Pure helpers (also used by property tests)
# ---------------------------------------------------------------------------

def _log_to_dict(log: AuditLog) -> dict[str, Any]:
    ts = None
    if log.time_stamp:
        try:
            ts = datetime.fromisoformat(log.time_stamp.replace("Z", "+00:00"))
        except Exception:
            ts = None
    return {
        "id": log.id,
        "user_id": log.user_id,
        "action_type": log.action_type,
        "resource_type": log.resource_type,
        "resource_id": log.resource_id,
        "timestamp": ts,
        "ip_address": log.ip_address,
    }


def filter_audit_records(
    records: list[dict[str, Any]],
    user_id: str | None = None,
    action_type: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[dict[str, Any]]:
    result = records
    if user_id is not None:
        result = [r for r in result if str(r.get("user_id")) == str(user_id)]
    if action_type:
        result = [r for r in result if r.get("action_type") == action_type]
    if date_from:
        result = [
            r for r in result
            if isinstance(r.get("timestamp"), datetime)
            and r["timestamp"].date() >= date_from
        ]
    if date_to:
        result = [
            r for r in result
            if isinstance(r.get("timestamp"), datetime)
            and r["timestamp"].date() <= date_to
        ]
    return result
