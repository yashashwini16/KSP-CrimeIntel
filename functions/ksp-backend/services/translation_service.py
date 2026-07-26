import json
import os
import re
from collections.abc import AsyncIterator

import httpx


class TranslationService:
    """Catalyst Zia translation adapter with local-safe fallbacks."""

    def __init__(self, endpoint: str | None = None, timeout: float = 20.0) -> None:
        self.endpoint = endpoint or os.environ.get("ZIA_TRANSLATION_ENDPOINT")
        self.timeout = timeout

    async def translate_to_kannada(self, text: str) -> str:
        if not text:
            return text
        if not self.endpoint:
            return text

        payload = {"text": text, "source_language": "en", "target_language": "kn"}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(self.endpoint, json=payload)
                response.raise_for_status()
                data = response.json()
        except Exception:  # noqa: BLE001
            return text

        translated = (
            data.get("translated_text")
            or data.get("translation")
            or data.get("text")
            or data.get("result", {}).get("text")
        )
        return translated if isinstance(translated, str) and translated else text

    async def translate_stream(
        self, token_stream: AsyncIterator[str], language: str
    ) -> AsyncIterator[str]:
        if language.lower() != "kn":
            async for token in token_stream:
                yield token
            return

        buffer = ""
        async for token in token_stream:
            buffer += token
            sentences, buffer = self._split_complete_sentences(buffer)
            for sentence in sentences:
                yield await self.translate_to_kannada(sentence)

        if buffer.strip():
            yield await self.translate_to_kannada(buffer)

    @staticmethod
    def _split_complete_sentences(text: str) -> tuple[list[str], str]:
        parts = re.split(r"([.!?]\s+|\n+)", text)
        complete: list[str] = []
        current = ""
        for idx in range(0, len(parts), 2):
            current += parts[idx]
            delimiter = parts[idx + 1] if idx + 1 < len(parts) else ""
            if delimiter:
                current += delimiter
                if current.strip():
                    complete.append(current)
                current = ""
        return complete, current


def extract_sse_text(line: str) -> str | None:
    """Shared parser for simple JSON or plain-text SSE data lines."""
    if not line.startswith("data:"):
        return None
    raw = line[5:].strip()
    if not raw or raw == "[DONE]":
        return None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return raw

    if isinstance(data, str):
        return data
    if not isinstance(data, dict):
        return None
    if "token" in data:
        return str(data["token"])
    if "text" in data:
        return str(data["text"])
    if "content" in data:
        return str(data["content"])
    choices = data.get("choices")
    if choices and isinstance(choices, list):
        delta = choices[0].get("delta", {}) if isinstance(choices[0], dict) else {}
        content = delta.get("content")
        if content is not None:
            return str(content)
    return None
