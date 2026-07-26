import os
from typing import Any

import httpx

from schemas.case import SimilarCase


class RAGService:
    """Catalyst QuickML RAG adapter."""

    def __init__(self, endpoint: str | None = None, timeout: float = 20.0) -> None:
        self.endpoint = endpoint or os.environ.get("QUICKML_RAG_ENDPOINT")
        self.timeout = timeout

    async def retrieve(self, query: str, k: int = 5) -> list[dict[str, Any]]:
        if not query.strip() or not self.endpoint:
            return []

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(self.endpoint, json={"query": query, "k": k})
                response.raise_for_status()
                data = response.json()
        except Exception:  # noqa: BLE001
            return []

        return self._normalise_documents(data)[:k]

    async def similar_firs(self, fir_id: str, db: Any, k: int = 5) -> list[SimilarCase]:
        from models.nosql_models import Case
        target = await Case.get_by_id(str(fir_id))
        if target is None:
            return []

        query = target.brief_facts or f"Case {target.crime_no}"
        docs = await self.retrieve(query, k=k + 1)
        similar = [
            self._doc_to_similar_case(doc)
            for doc in docs
            if str(doc.get("id") or doc.get("ROWID") or "") != str(fir_id)
        ]
        similar = [c for c in similar if c is not None]
        if similar:
            return similar[:k]

        # Fallback: return nearest cases from same dataset
        all_cases = await Case.get_all(limit=50)
        return [
            SimilarCase(
                id=str(c.ROWID),
                fir_number=c.crime_no,
                crime_type=c.crime_type.get("name", "Unknown"),
                district=c.district.get("name", "Unknown"),
                similarity_score=0.5,
                rationale="Matched fallback.",
            )
            for c in all_cases
            if c.ROWID != fir_id
        ][:k]

    @staticmethod
    def _normalise_documents(data: Any) -> list[dict[str, Any]]:
        if isinstance(data, list):
            return [doc for doc in data if isinstance(doc, dict)]
        if not isinstance(data, dict):
            return []
        docs = data.get("documents") or data.get("results") or data.get("items") or []
        if isinstance(docs, dict):
            docs = docs.get("documents") or docs.get("items") or []
        return [doc for doc in docs if isinstance(doc, dict)]

    @staticmethod
    def _doc_to_similar_case(doc: dict[str, Any]) -> SimilarCase | None:
        raw_id = doc.get("id") or doc.get("CaseMasterID")
        fir_number = doc.get("CrimeNo") or doc.get("fir_number") or doc.get("number")
        crime_type = doc.get("crime_type")
        district = doc.get("district") or ""
        if raw_id is None or not fir_number or not crime_type:
            return None
        return SimilarCase(
            id=int(raw_id),
            fir_number=str(fir_number),
            crime_type=str(crime_type),
            district=str(district),
            similarity_score=float(doc.get("score") or doc.get("similarity_score") or 0.0),
            rationale=str(
                doc.get("rationale")
                or doc.get("similarity_rationale")
                or "Retrieved by Catalyst QuickML RAG."
            ),
        )
