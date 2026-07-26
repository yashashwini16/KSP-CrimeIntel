"""Export service — NoSQL edition. Generates PDFs via Catalyst SmartBrowz."""

import base64
import os
from pathlib import Path
from typing import Any

import httpx
from fastapi import HTTPException
from jinja2 import Environment, FileSystemLoader, select_autoescape

from services.risk_service import RiskService
from utils.helpers import log_audit


class ExportService:
    def __init__(
        self,
        smartbrowz_endpoint: str | None = None,
        stratus_endpoint: str | None = None,
        template_dir: str | Path | None = None,
    ) -> None:
        self.smartbrowz_endpoint = smartbrowz_endpoint or os.environ.get("SMARTBROWZ_ENDPOINT")
        self.stratus_endpoint = stratus_endpoint or os.environ.get("CATALYST_STRATUS_ENDPOINT")
        self.bucket = os.environ.get("CATALYST_STRATUS_BUCKET", "ksp-pdfs")
        templates = Path(template_dir or Path(__file__).resolve().parents[1] / "templates")
        self.jinja = Environment(
            loader=FileSystemLoader(templates),
            autoescape=select_autoescape(["html", "xml"]),
        )

    async def generate_case_pdf(self, fir_id: str, db: Any) -> str:
        from models.nosql_models import Case
        case = await Case.get_by_id(fir_id)
        if case is None:
            raise HTTPException(status_code=404, detail="Case not found")
        html = self.jinja.get_template("case_report.html").render(fir=case)
        return await self._render_upload_or_fail(html, f"case-{fir_id}.pdf", db, "case", fir_id)

    async def generate_offender_pdf(self, offender_id: str, db: Any) -> str:
        risk_score = await RiskService().compute_risk_score(offender_id, db)
        html = self.jinja.get_template("offender_report.html").render(
            accused={"id": offender_id},
            risk_score=risk_score,
            firs=[],
        )
        return await self._render_upload_or_fail(
            html, f"offender-{offender_id}.pdf", db, "accused", offender_id
        )

    async def generate_chat_pdf(self, session_id: str, db: Any) -> str:
        from models.nosql_models import ChatSession
        from models.database import get_catalyst_db, Collections
        catalyst_db = get_catalyst_db()
        doc = await catalyst_db.get_document(Collections.CHATS, session_id)
        if doc is None:
            raise HTTPException(status_code=404, detail="Chat session not found")
        session = ChatSession(**doc)
        html = self.jinja.get_template("chat_transcript.html").render(session=session)
        return await self._render_upload_or_fail(
            html, f"chat-{session_id}.pdf", db, "chat_session", session_id
        )

    async def _render_upload_or_fail(
        self, html: str, filename: str, db: Any, resource_type: str, resource_id: str
    ) -> str:
        try:
            pdf_bytes = await self._html_to_pdf(html)
            return await self._upload_to_stratus(filename, pdf_bytes)
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            await log_audit(db, "system", "pdf_export_failed", resource_type, resource_id, None)
            raise HTTPException(status_code=500, detail="PDF generation failed") from exc

    async def _html_to_pdf(self, html: str) -> bytes:
        if not self.smartbrowz_endpoint:
            return html.encode("utf-8")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(self.smartbrowz_endpoint, json={"html": html})
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                data = response.json()
                encoded = data.get("pdf") or data.get("content")
                if isinstance(encoded, str):
                    try:
                        return base64.b64decode(encoded, validate=True)
                    except Exception:  # noqa: BLE001
                        return encoded.encode("utf-8")
            return response.content

    async def _upload_to_stratus(self, filename: str, content: bytes) -> str:
        if not self.stratus_endpoint:
            return f"stratus://{self.bucket}/{filename}"
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.put(
                f"{self.stratus_endpoint.rstrip('/')}/{self.bucket}/{filename}",
                content=content,
                headers={"content-type": "application/pdf"},
            )
            response.raise_for_status()
            data = (
                response.json()
                if response.headers.get("content-type", "").startswith("application/json")
                else {}
            )
        return str(
            data.get("url")
            or f"{self.stratus_endpoint.rstrip('/')}/{self.bucket}/{filename}"
        )
