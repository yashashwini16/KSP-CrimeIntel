"""
AI service — NoSQL edition.
SQL execution removed (no relational DB). RAG + QuickML LLM streaming intact.
Chat sessions persisted via nosql_models.ChatSession.
"""

import asyncio
import json
import os
import re
from collections.abc import AsyncIterator
from typing import Any

import httpx

from services.rag_service import RAGService
from services.translation_service import TranslationService, extract_sse_text
from utils.prompts import build_chat_prompt


class AIService:
    """Catalyst QuickML LLM service — RAG augmentation and streaming chat."""

    TEMPORARY_UNAVAILABLE = (
        "503: AI service is temporarily unavailable. Please try again in a few minutes."
    )

    def __init__(
        self,
        endpoint: str | None = None,
        rag_service: RAGService | None = None,
        translation_service: TranslationService | None = None,
        timeout: float = 60.0,
    ) -> None:
        self.endpoint = endpoint or os.environ.get("QUICKML_ENDPOINT")
        self.rag_service = rag_service or RAGService()
        self.translation_service = translation_service or TranslationService()
        self.timeout = timeout
        self.last_prompt: str | None = None

    async def chat_stream(
        self,
        query: str,
        language: str,
        db: Any,
        *,
        user_id: str = "1",
    ) -> AsyncIterator[str]:
        full_response: list[str] = []

        try:
            rag_docs = await self.rag_service.retrieve(query, k=5)
            # No SQL in NoSQL mode — pass empty results
            sql_results: list[dict[str, Any]] = []
            prompt = build_chat_prompt(query, rag_docs, sql_results)
            self.last_prompt = prompt

            async def raw_stream() -> AsyncIterator[str]:
                async for token in self._stream_llm(prompt):
                    yield token

            stream = self.translation_service.translate_stream(raw_stream(), language)
            async for token in stream:
                full_response.append(token)
                yield token
        except Exception:  # noqa: BLE001
            yield self.TEMPORARY_UNAVAILABLE
        finally:
            response = "".join(full_response).strip()
            if response:
                self._schedule_persist(user_id, query, response, language)

    async def _stream_llm(self, prompt: str) -> AsyncIterator[str]:
        if not self.endpoint:
            # Return a graceful fallback when QuickML is not configured
            yield "AI endpoint is not configured. Please set QUICKML_ENDPOINT."
            return

        payload = {"task": "chat", "prompt": prompt, "stream": True}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream("POST", self.endpoint, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    token = extract_sse_text(line)
                    if token:
                        yield token

    def _schedule_persist(
        self, user_id: str, query: str, response: str, language: str
    ) -> None:
        async def persist() -> None:
            from models.nosql_models import ChatSession
            try:
                await ChatSession.create(
                    user_id=str(user_id),
                    query=query,
                    response=response,
                    language=language,
                )
            except Exception:  # noqa: BLE001
                pass

        try:
            loop = asyncio.get_running_loop()
            task = loop.create_task(persist())
            task.add_done_callback(
                lambda done: done.exception() if done.exception() else None
            )
        except RuntimeError:
            asyncio.run(persist())

    @staticmethod
    def _strip_code_fence(value: str) -> str:
        value = value.strip()
        if value.startswith("```"):
            value = re.sub(r"^```(?:sql)?\s*", "", value, flags=re.I)
            value = re.sub(r"\s*```$", "", value)
        return value

    @staticmethod
    def _is_safe_select(sql: str | None) -> bool:
        if not sql:
            return False
        stripped = sql.strip().rstrip(";")
        if not re.match(r"^select\b", stripped, flags=re.I):
            return False
        forbidden = r"\b(insert|update|delete|drop|alter|truncate|create|replace|grant)\b"
        return re.search(forbidden, stripped, flags=re.I) is None
