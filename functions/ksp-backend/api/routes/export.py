"""PDF export endpoints — generate case PDFs via Catalyst SmartBrowz."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Request

from models.database import get_db
from services.export_service import ExportService
from utils.catalyst_auth import get_current_user
from utils.helpers import log_audit

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/case/{fir_id}")
async def export_case(
    fir_id: str,
    request: Request,
    db: Annotated[object, Depends(get_db)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> dict[str, str]:
    url = await ExportService().generate_case_pdf(fir_id, db)
    await log_audit(
        db,
        user_id=str(current_user.id),
        action_type="pdf_export",
        resource_type="case",
        resource_id=fir_id,
        ip_address=request.client.host if request.client else None,
    )
    return {"url": url}


@router.get("/offender/{offender_id}")
async def export_offender(
    offender_id: str,
    request: Request,
    db: Annotated[object, Depends(get_db)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> dict[str, str]:
    url = await ExportService().generate_offender_pdf(offender_id, db)
    await log_audit(
        db,
        user_id=str(current_user.id),
        action_type="pdf_export",
        resource_type="accused",
        resource_id=offender_id,
        ip_address=request.client.host if request.client else None,
    )
    return {"url": url}


@router.get("/chat/{session_id}")
async def export_chat(
    session_id: str,
    request: Request,
    db: Annotated[object, Depends(get_db)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> dict[str, str]:
    url = await ExportService().generate_chat_pdf(session_id, db)
    await log_audit(
        db,
        user_id=str(current_user.id),
        action_type="pdf_export",
        resource_type="chat_session",
        resource_id=session_id,
        ip_address=request.client.host if request.client else None,
    )
    return {"url": url}
