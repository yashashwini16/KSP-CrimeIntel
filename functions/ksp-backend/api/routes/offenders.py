"""Offender / Accused profile endpoints — NoSQL edition."""

import logging
from math import ceil
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from models.database import get_db
from models.nosql_models import Case
from schemas.common import PaginatedResponse
from schemas.offender import (
    FIRBriefSchema,
    LinkBriefSchema,
    OffenderDetail,
    OffenderSummary,
)
from utils.catalyst_auth import get_current_user
from utils.helpers import log_audit

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["offenders"])


def _collect_offenders(cases: list[Case]) -> dict[str, dict[str, Any]]:
    """
    Extract accused persons from embedded case documents.
    Returns a dict keyed by a synthetic offender_id (case_rowid__index).
    """
    offenders: dict[str, dict[str, Any]] = {}
    for case in cases:
        for idx, accused in enumerate(case.accused_persons):
            oid = f"{case.ROWID}__{idx}"
            if oid not in offenders:
                offenders[oid] = {
                    "id": oid,
                    "name": accused.get("name", "Unknown"),
                    "age": accused.get("age"),
                    "gender": str(accused.get("gender", "")),
                    "address": accused.get("address", ""),
                    "risk_score": accused.get("risk_score", 0),
                    "cases": [],
                }
            offenders[oid]["cases"].append(case)
    return offenders


@router.get("/offenders", response_model=PaginatedResponse[OffenderSummary])
async def list_offenders(
    db: Annotated[object, Depends(get_db)],
    _current_user: Annotated[Any, Depends(get_current_user)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    min_risk: Annotated[int | None, Query(ge=0, le=100)] = None,
    max_risk: Annotated[int | None, Query(ge=0, le=100)] = None,
    crime_type: str | None = None,
    district: str | None = None,
) -> PaginatedResponse[OffenderSummary]:
    cases = await Case.search(
        crime_type=crime_type, district=district, limit=500
    )
    offenders = _collect_offenders(cases)

    summaries: list[OffenderSummary] = []
    for oid, data in offenders.items():
        risk = data["risk_score"]
        if min_risk is not None and risk < min_risk:
            continue
        if max_risk is not None and risk > max_risk:
            continue
        summaries.append(
            OffenderSummary(
                id=oid,
                name=data["name"],
                age=data["age"],
                gender=data["gender"],
                address=data["address"],
                photo_url=None,
                risk_score=risk,
                fir_count=len(data["cases"]),
            )
        )

    total = len(summaries)
    start = (page - 1) * page_size
    items = summaries[start: start + page_size]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=ceil(total / page_size) if total else 0,
    )


@router.get("/offenders/{offender_id}", response_model=OffenderDetail)
async def get_offender_detail(
    offender_id: str,
    request: Request,
    db: Annotated[object, Depends(get_db)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> OffenderDetail:
    # offender_id format: "{case_rowid}__{index}"
    if "__" not in offender_id:
        raise HTTPException(status_code=404, detail="Offender not found")

    case_rowid, _, idx_str = offender_id.partition("__")
    case = await Case.get_by_id(case_rowid)
    if case is None:
        raise HTTPException(status_code=404, detail="Offender not found")

    try:
        idx = int(idx_str)
        accused = case.accused_persons[idx]
    except (ValueError, IndexError):
        raise HTTPException(status_code=404, detail="Offender not found")

    await log_audit(
        db,
        user_id=str(current_user.id),
        action_type="offender_view",
        resource_type="accused",
        resource_id=offender_id,
        ip_address=request.client.host if request.client else None,
    )

    # Build FIR list — search all cases this accused appears in by name
    all_cases = await Case.get_all(limit=500)
    accused_name = accused.get("name", "")
    fir_schemas: list[FIRBriefSchema] = []
    for c in all_cases:
        for a in c.accused_persons:
            if a.get("name") == accused_name:
                fir_schemas.append(
                    FIRBriefSchema(
                        id=str(c.ROWID),
                        fir_number=c.crime_no,
                        date=c.crime_registered_date,
                        crime_type=c.crime_type.get("name", "Unknown"),
                        district=c.district.get("name", "Unknown"),
                        status=c.case_status.get("name", "Unknown"),
                    )
                )
                break

    return OffenderDetail(
        id=offender_id,
        name=accused.get("name", "Unknown"),
        age=accused.get("age"),
        gender=str(accused.get("gender", "")),
        address=accused.get("address", ""),
        phone=None,
        photo_url=None,
        created_at=None,
        risk_score=accused.get("risk_score", 0),
        firs=fir_schemas,
        links=[],
    )


# ── Pure helpers ──────────────────────────────────────────────────────────────

def filter_offenders(
    summaries: list[OffenderSummary],
    *,
    min_risk: int | None = None,
    max_risk: int | None = None,
) -> list[OffenderSummary]:
    result = summaries
    if min_risk is not None:
        result = [s for s in result if s.risk_score >= min_risk]
    if max_risk is not None:
        result = [s for s in result if s.risk_score <= max_risk]
    return result


def paginate_offender_summaries(
    summaries: list[OffenderSummary], page: int, page_size: int
) -> PaginatedResponse[OffenderSummary]:
    total = len(summaries)
    start = (page - 1) * page_size
    items = summaries[start: start + page_size]
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=ceil(total / page_size) if total else 0,
    )
