"""
Cases route — NoSQL edition.
All SQLAlchemy joins replaced with in-memory filtering over Catalyst documents.
"""

from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from math import ceil
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from models.database import get_db
from models.nosql_models import AuditLog, Case
from schemas.case import CaseAccused, CaseLocation, CaseSummary, SimilarCase
from schemas.common import AuditLogSchema, PaginatedResponse
from services.rag_service import RAGService
from utils.catalyst_auth import get_current_user
from utils.helpers import log_audit

router = APIRouter(prefix="/api", tags=["cases"])


# ---------------------------------------------------------------------------
# List cases  GET /api/cases
# ---------------------------------------------------------------------------

@router.get("/cases", response_model=PaginatedResponse[CaseSummary])
async def list_cases(
    db: Annotated[object, Depends(get_db)],
    _current_user: Annotated[Any, Depends(get_current_user)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    crime_type: str | None = None,
    district: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    keyword: str | None = None,
) -> PaginatedResponse[CaseSummary]:
    # Fetch a large batch then filter in Python (ZCQL has no JOIN)
    cases = await Case.search(
        crime_type=crime_type,
        district=district,
        keyword=keyword,
        limit=500,
    )

    # Date filter (in-memory)
    if date_from or date_to:
        filtered: list[Case] = []
        for c in cases:
            d = c.CrimeRegisteredDate
            if d is None:
                continue
            if date_from and d < date_from:
                continue
            if date_to and d > date_to:
                continue
            filtered.append(c)
        cases = filtered

    total = len(cases)
    start = (page - 1) * page_size
    page_items = cases[start: start + page_size]

    items = [_case_to_summary(c) for c in page_items]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=ceil(total / page_size) if total else 0,
    )


# ---------------------------------------------------------------------------
# Case detail  GET /api/cases/{fir_id}
# ---------------------------------------------------------------------------

@router.get("/cases/{fir_id}")
async def get_case_detail(
    fir_id: str,
    request: Request,
    db: Annotated[object, Depends(get_db)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> dict[str, Any]:
    case = await Case.get_by_id(fir_id)
    if case is None:
        raise HTTPException(status_code=404, detail="FIR not found")

    await log_audit(
        db,
        user_id=str(current_user.id),
        action_type="fir_view",
        resource_type="case",
        resource_id=fir_id,
        ip_address=request.client.host if request.client else None,
    )

    accused_list = [
        CaseAccused(
            id=i + 1,
            name=a.get("name", "Unknown"),
            age=a.get("age"),
            gender=str(a.get("gender", "")),
            role="Accused",
        ).model_dump(mode="json")
        for i, a in enumerate(case.accused_persons)
    ]

    victims_list = [
        {
            "id": i + 1,
            "name": v.get("name", "Unknown"),
            "age": v.get("age"),
            "gender": str(v.get("gender", "")),
        }
        for i, v in enumerate(case.victims)
    ]

    locations = []
    if case.latitude and case.longitude:
        locations.append(
            CaseLocation(
                id=1,
                latitude=case.latitude,
                longitude=case.longitude,
                address="",
            ).model_dump(mode="json")
        )

    # Audit trail for this case
    all_logs = await AuditLog.get_all(limit=200)
    audit_trail = [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action_type": log.action_type,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "timestamp": log.timestamp,
            "ip_address": log.ip_address,
        }
        for log in all_logs
        if log.resource_type == "case" and log.resource_id == fir_id
    ]

    return {
        "id": case.ROWID,
        "fir_number": case.crime_no,
        "date": case.crime_registered_date,
        "crime_type": case.crime_type.get("name", "Unknown"),
        "district": case.district.get("name", "Unknown"),
        "station": case.police_station.get("name", "Unknown"),
        "status": case.case_status.get("name", "Unknown"),
        "modus_operandi": (case.brief_facts or "")[:100],
        "narrative": case.brief_facts,
        "created_at": None,  # Catalyst stores CREATEDTIME internally
        "accused": accused_list,
        "victims": victims_list,
        "locations": locations,
        "audit_trail": audit_trail,
    }


# ---------------------------------------------------------------------------
# Similar cases  GET /api/cases/{fir_id}/similar
# ---------------------------------------------------------------------------

@router.get("/cases/{fir_id}/similar", response_model=list[SimilarCase])
async def similar_cases(
    fir_id: str,
    db: Annotated[object, Depends(get_db)],
    _current_user: Annotated[Any, Depends(get_current_user)],
) -> list[SimilarCase]:
    case = await Case.get_by_id(fir_id)
    if case is None:
        raise HTTPException(status_code=404, detail="FIR not found")

    rag_results = await RAGService().retrieve(
        query=case.brief_facts or case.crime_no, k=5
    )

    similar: list[SimilarCase] = []
    for doc in rag_results:
        raw_id = doc.get("id") or doc.get("ROWID")
        if raw_id is None or str(raw_id) == fir_id:
            continue
        fir_number = doc.get("crime_no") or doc.get("fir_number") or str(raw_id)
        crime_type = doc.get("crime_type") or "Unknown"
        if isinstance(crime_type, dict):
            crime_type = crime_type.get("name", "Unknown")
        similar.append(
            SimilarCase(
                id=str(raw_id),
                fir_number=str(fir_number),
                crime_type=str(crime_type),
                district=str(doc.get("district", {}).get("name", "") if isinstance(doc.get("district"), dict) else doc.get("district", "")),
                similarity_score=float(doc.get("score") or doc.get("similarity_score") or 0.0),
                rationale=str(doc.get("rationale") or "Retrieved by Catalyst QuickML RAG."),
            )
        )

    # Fallback: return nearest cases by district if RAG returns nothing
    if not similar:
        all_cases = await Case.get_all(limit=50)
        for c in all_cases:
            if c.ROWID == fir_id:
                continue
            similar.append(
                SimilarCase(
                    id=str(c.ROWID),
                    fir_number=c.crime_no,
                    crime_type=c.crime_type.get("name", "Unknown"),
                    district=c.district.get("name", "Unknown"),
                    similarity_score=0.4,
                    rationale="Fallback: same dataset.",
                )
            )
            if len(similar) >= 5:
                break

    return similar


# ---------------------------------------------------------------------------
# Hotspots  GET /api/map/hotspots
# ---------------------------------------------------------------------------

@router.get("/map/hotspots")
async def map_hotspots(
    db: Annotated[object, Depends(get_db)],
    _current_user: Annotated[Any, Depends(get_current_user)],
    crime_type: str | None = None,
    district: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[dict[str, Any]]:
    cases = await Case.search(crime_type=crime_type, district=district, limit=500)

    records = []
    for c in cases:
        if c.latitude is None or c.longitude is None:
            continue
        d = c.CrimeRegisteredDate
        if date_from and d and d < date_from:
            continue
        if date_to and d and d > date_to:
            continue
        records.append(
            {
                "latitude": c.latitude,
                "longitude": c.longitude,
                "district": c.district.get("name", "Unknown"),
                "crime_type": c.crime_type.get("name", "Unknown"),
                "date": d,
                "fir_id": c.ROWID,
            }
        )

    return _aggregate_hotspots(records)


# ---------------------------------------------------------------------------
# Pure helpers
# ---------------------------------------------------------------------------

def _case_to_summary(c: Case) -> CaseSummary:
    return CaseSummary(
        id=str(c.ROWID),
        fir_number=c.crime_no,
        date=c.crime_registered_date,
        crime_type=c.crime_type.get("name", "Unknown"),
        district=c.district.get("name", "Unknown"),
        station=c.police_station.get("name", "Unknown"),
        status=c.case_status.get("name", "Unknown"),
        modus_operandi=(c.brief_facts or "")[:100],
        accused_count=len(c.accused_persons),
        victim_count=len(c.victims),
    )


def _aggregate_hotspots(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[tuple, dict[str, Any]] = {}
    crime_counts: dict[tuple, defaultdict[str, int]] = {}
    dates: dict[tuple, list] = defaultdict(list)

    for r in records:
        key = (str(r["latitude"]), str(r["longitude"]))
        if key not in buckets:
            buckets[key] = {
                "latitude": r["latitude"],
                "longitude": r["longitude"],
                "district": r["district"],
                "fir_count": 0,
                "fir_ids": [],
            }
            crime_counts[key] = defaultdict(int)
        buckets[key]["fir_count"] += 1
        buckets[key]["fir_ids"].append(r["fir_id"])
        crime_counts[key][r["crime_type"]] += 1
        if r["date"]:
            dates[key].append(r["date"])

    result = []
    for key, bucket in buckets.items():
        most_common = max(crime_counts[key].items(), key=lambda x: x[1])[0]
        d_list = dates[key]
        result.append(
            {
                **bucket,
                "most_frequent_crime_type": most_common,
                "crime_type": most_common,
                "date_from": min(d_list) if d_list else None,
                "date_to": max(d_list) if d_list else None,
            }
        )
    return result
