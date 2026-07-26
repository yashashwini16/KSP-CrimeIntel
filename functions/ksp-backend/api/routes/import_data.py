"""
Import route — NoSQL edition.
Accepts Excel/CSV uploads and bulk-inserts Case documents into Catalyst Data Store.
"""

import csv
import io
import random
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from models.database import get_db
from models.nosql_models import Case

router = APIRouter(prefix="/api/import", tags=["import"])


# ---------------------------------------------------------------------------
# File parsing
# ---------------------------------------------------------------------------

def _read_file(content: bytes, filename: str) -> list[dict[str, Any]]:
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "csv":
        decoded = content.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(decoded))
        return [dict(row) for row in reader]

    if ext in ("xls", "xlsx"):
        try:
            import openpyxl  # type: ignore
            wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
            ws = wb.active
            rows = list(ws.iter_rows(values_only=True))
            if not rows:
                return []
            headers = [
                str(h).strip() if h is not None else f"col_{i}"
                for i, h in enumerate(rows[0])
            ]
            return [
                dict(zip(headers, row))
                for row in rows[1:]
                if any(cell is not None for cell in row)
            ]
        except ImportError:
            raise HTTPException(
                status_code=400,
                detail="openpyxl not installed — upload a CSV instead.",
            )

    raise HTTPException(
        status_code=400, detail=f"Unsupported file type: {ext}. Use CSV or XLSX."
    )


def _normalize(row: dict, *keys: str) -> str | None:
    for k in keys:
        for rk, rv in row.items():
            if rk.strip().lower().replace(" ", "_") == k.lower().replace(" ", "_"):
                val = str(rv).strip() if rv is not None else ""
                return val if val else None
    return None


# ---------------------------------------------------------------------------
# Preview  POST /api/import/preview
# ---------------------------------------------------------------------------

@router.post("/preview")
async def preview_file(file: UploadFile = File(...)):
    content = await file.read()
    rows = _read_file(content, file.filename or "upload.csv")
    headers = list(rows[0].keys()) if rows else []
    return {"headers": headers, "preview": rows[:5], "total_rows": len(rows)}


# ---------------------------------------------------------------------------
# Import cases  POST /api/import/cases
# ---------------------------------------------------------------------------

@router.post("/cases")
async def import_cases(
    file: UploadFile = File(...),
    db: object = Depends(get_db),
):
    content = await file.read()
    rows = _read_file(content, file.filename or "upload.csv")

    if not rows:
        raise HTTPException(status_code=400, detail="File is empty or has no data rows.")

    imported = 0
    errors: list[str] = []

    for i, row in enumerate(rows[:5000], start=2):
        try:
            fir_no = (
                _normalize(row, "fir_number", "CrimeNo", "FIR_Number", "fir")
                or f"IMP/{datetime.now().year}/{i}"
            )
            date_raw = (
                _normalize(row, "date", "CrimeRegisteredDate", "registered_date")
                or datetime.now().strftime("%Y-%m-%d")
            )

            # Normalise date string to YYYY-MM-DD
            date_val = datetime.now().strftime("%Y-%m-%d")
            for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y"):
                try:
                    date_val = datetime.strptime(date_raw[:10], fmt).strftime("%Y-%m-%d")
                    break
                except ValueError:
                    pass

            lat_raw = _normalize(row, "latitude", "lat")
            lng_raw = _normalize(row, "longitude", "lon", "lng")
            lat = float(lat_raw) if lat_raw else round(random.uniform(11.5, 18.5), 6)
            lng = float(lng_raw) if lng_raw else round(random.uniform(74.0, 78.5), 6)
            brief = (
                _normalize(row, "brief_facts", "BriefFacts", "description", "narration")
                or "Imported record."
            )

            district_name = _normalize(row, "district", "DistrictName") or "Unknown"
            crime_type_name = (
                _normalize(row, "crime_type", "CrimeGroupName", "Crime_Type") or "Unknown"
            )
            status_name = _normalize(row, "status", "CaseStatus") or "open"

            await Case.create_document(
                case_data={
                    "crime_no": fir_no,
                    "case_no": fir_no,
                    "crime_registered_date": date_val,
                    "brief_facts": brief,
                    "latitude": lat,
                    "longitude": lng,
                    "district": {"name": district_name},
                    "police_station": {"name": district_name},
                    "case_category": {"name": "FIR"},
                    "crime_type": {"name": crime_type_name},
                    "case_status": {"name": status_name},
                },
            )
            imported += 1

        except Exception as exc:  # noqa: BLE001
            errors.append(f"Row {i}: {exc}")

    return {
        "imported": imported,
        "skipped": len(errors),
        "total_rows": len(rows),
        "errors": errors[:20],
    }
