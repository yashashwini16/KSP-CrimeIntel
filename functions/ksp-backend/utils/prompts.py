import json
from typing import Any


SYSTEM_PROMPT = (
    "You are KSP CrimeIntel, an analytical assistant for Karnataka State Police. "
    "Answer only from the provided FIR, accused, network, analytics, and SQL context. "
    "Be concise, cite the relevant case identifiers when available, and say when the "
    "available context is insufficient."
)


def _format_context_block(title: str, value: Any) -> str:
    if not value:
        return f"{title}:\nNone"
    if isinstance(value, str):
        return f"{title}:\n{value}"
    return f"{title}:\n{json.dumps(value, ensure_ascii=False, default=str, indent=2)}"


def build_chat_prompt(query: str, rag_docs: Any, sql_results: Any) -> str:
    return "\n\n".join(
        [
            f"System:\n{SYSTEM_PROMPT}",
            _format_context_block("RAG context", rag_docs),
            _format_context_block("SQL results", sql_results),
            f"User query:\n{query}",
            "Assistant:",
        ]
    )
