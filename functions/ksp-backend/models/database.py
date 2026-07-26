"""
Catalyst Data Store — NoSQL database layer.

Replaces the SQLAlchemy/asyncmy stack entirely.
Catalyst auto-creates: ROWID, CREATORID, CREATEDTIME, MODIFIEDTIME.
We never set those manually — the SDK and platform handle them.

IMPORTANT: catalyst.initialize() is called lazily (on first DB operation),
not at import time, so startup never crashes due to missing credentials.
"""

import json
import os
from typing import Any, Dict, List, Optional

try:
    import zcatalyst_sdk as _sdk  # noqa: F401
    from zcatalyst_sdk import catalyst  # type: ignore
    _CATALYST_AVAILABLE = True
except ImportError:
    catalyst = None  # type: ignore
    _CATALYST_AVAILABLE = False


class CatalystDB:
    """
    Thin async-compatible wrapper around the synchronous zcatalyst-sdk.
    SDK is initialised lazily on first use so the process starts up cleanly
    even before Catalyst injects its runtime credentials.
    """

    def __init__(self) -> None:
        self._app = None
        self._ds = None

    def _ensure_connected(self) -> None:
        """Lazy init — called before every SDK operation."""
        if self._ds is not None:
            return

        if not _CATALYST_AVAILABLE:
            raise RuntimeError(
                "zcatalyst-sdk is not installed. Run: pip install zcatalyst-sdk"
            )

        try:
            self._app = catalyst.initialize()
            self._ds = self._app.datastore()
        except Exception as exc:
            raise RuntimeError(
                f"Failed to connect to Catalyst Data Store: {exc}\n"
                "Make sure the app is running inside Catalyst AppSail "
                "or that CATALYST_* credentials are set in the environment."
            ) from exc

    # ── helpers ──────────────────────────────────────────────────────────────

    def _table(self, table_name: str):
        self._ensure_connected()
        return self._ds.table(table_name)

    @staticmethod
    def _clean(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Serialize nested dicts/lists to JSON strings before sending to
        Catalyst (which only accepts scalar column values).
        Strip None values so Catalyst uses its own defaults.
        """
        cleaned: Dict[str, Any] = {}
        for k, v in data.items():
            if v is None:
                continue
            if isinstance(v, (dict, list)):
                cleaned[k] = json.dumps(v, ensure_ascii=False)
            elif isinstance(v, bool):
                cleaned[k] = v
            else:
                cleaned[k] = v
        return cleaned

    @staticmethod
    def _parse(row: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deserialize JSON strings back to Python objects when reading rows.
        ROWID comes back as a string — keep it that way.
        """
        parsed: Dict[str, Any] = {}
        for k, v in row.items():
            if isinstance(v, str) and len(v) > 1 and v[0] in ("{", "["):
                try:
                    parsed[k] = json.loads(v)
                except (ValueError, TypeError):
                    parsed[k] = v
            else:
                parsed[k] = v
        return parsed

    # ── CRUD ─────────────────────────────────────────────────────────────────

    async def insert_document(
        self, table_name: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            result = self._table(table_name).insert_row(self._clean(data))
            return self._parse(result)
        except RuntimeError:
            raise
        except Exception as exc:
            raise RuntimeError(
                f"insert_document failed on '{table_name}': {exc}"
            ) from exc

    async def get_document(
        self, table_name: str, row_id: str
    ) -> Optional[Dict[str, Any]]:
        try:
            result = self._table(table_name).get_row(str(row_id))
            return self._parse(result) if result else None
        except RuntimeError:
            raise
        except Exception as exc:
            if "not found" in str(exc).lower() or "404" in str(exc):
                return None
            raise RuntimeError(
                f"get_document failed on '{table_name}' id={row_id}: {exc}"
            ) from exc

    async def update_document(
        self, table_name: str, row_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            result = self._table(table_name).update_row(
                str(row_id), self._clean(data)
            )
            return self._parse(result)
        except RuntimeError:
            raise
        except Exception as exc:
            raise RuntimeError(
                f"update_document failed on '{table_name}' id={row_id}: {exc}"
            ) from exc

    async def delete_document(self, table_name: str, row_id: str) -> bool:
        try:
            self._table(table_name).delete_row(str(row_id))
            return True
        except RuntimeError:
            raise
        except Exception as exc:
            raise RuntimeError(
                f"delete_document failed on '{table_name}' id={row_id}: {exc}"
            ) from exc

    async def query_documents(
        self,
        table_name: str,
        query: Optional[str] = None,
        max_rows: int = 200,
    ) -> List[Dict[str, Any]]:
        """
        Query rows with an optional ZCQL WHERE clause.
        Example:  query="crime_no = 'FIR/2024/1001'"
        """
        try:
            tbl = self._table(table_name)
            if query:
                rows = tbl.get_rows(query=query, max_rows=max_rows)
            else:
                rows = tbl.get_rows(max_rows=max_rows)
            if not isinstance(rows, list):
                return []
            return [self._parse(r) for r in rows]
        except RuntimeError:
            raise
        except Exception as exc:
            raise RuntimeError(
                f"query_documents failed on '{table_name}': {exc}"
            ) from exc

    async def count_documents(
        self, table_name: str, query: Optional[str] = None
    ) -> int:
        try:
            rows = await self.query_documents(table_name, query, max_rows=5000)
            return len(rows)
        except Exception:
            return 0


# ── Singleton ────────────────────────────────────────────────────────────────

_db_instance: Optional[CatalystDB] = None


def get_catalyst_db() -> CatalystDB:
    global _db_instance
    if _db_instance is None:
        _db_instance = CatalystDB()
    return _db_instance


# ── FastAPI dependency ────────────────────────────────────────────────────────

async def get_db() -> CatalystDB:
    """Drop-in replacement for the old SQLAlchemy get_db dependency."""
    return get_catalyst_db()


# ── Collection name constants ─────────────────────────────────────────────────

class Collections:
    CASES       = "cases"
    USERS       = "users"
    LOOKUPS     = "lookups"
    CHATS       = "chat_sessions"
    ALERTS      = "alerts"
    AUDIT_LOGS  = "audit_logs"


# ── Legacy stubs ──────────────────────────────────────────────────────────────

DATABASE_URL = os.environ.get("DATABASE_URL", "")
Base = None
engine = None
