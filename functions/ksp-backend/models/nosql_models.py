"""
NoSQL Pydantic models for Catalyst Data Store.

Key conventions:
  - ROWID  = Catalyst auto-generated string ID (never set manually)
  - CREATEDTIME / MODIFIEDTIME = auto-managed by Catalyst (never set manually)
  - Nested objects (district, accused_persons, etc.) are stored as
    JSON strings in Catalyst and deserialized automatically by CatalystDB._parse()
"""

import json
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, model_validator

from .database import Collections, get_catalyst_db


# ── Base ──────────────────────────────────────────────────────────────────────

class CatalystDocument(BaseModel):
    """Base for every NoSQL document. ROWID comes back from Catalyst as a string."""
    ROWID: Optional[str] = None  # auto-set by Catalyst on insert

    model_config = {"populate_by_name": True, "extra": "ignore"}


# ── User ─────────────────────────────────────────────────────────────────────

class User(CatalystDocument):
    username: str
    password_hash: str
    role: str = "analyst"

    # ── convenience shims so existing route code keeps working ──────────────
    @property
    def id(self) -> int:
        """Routes expect an int id; we derive it from ROWID."""
        try:
            return int(self.ROWID or 0)
        except (ValueError, TypeError):
            return 0

    @classmethod
    async def get_by_username(cls, username: str) -> Optional["User"]:
        db = get_catalyst_db()
        rows = await db.query_documents(
            Collections.USERS,
            query=f"username = '{username}'",
            max_rows=1,
        )
        return cls(**rows[0]) if rows else None

    @classmethod
    async def create(
        cls, username: str, password_hash: str, role: str = "analyst"
    ) -> "User":
        db = get_catalyst_db()
        result = await db.insert_document(
            Collections.USERS,
            {"username": username, "password_hash": password_hash, "role": role},
        )
        return cls(**result)


# ── Case ─────────────────────────────────────────────────────────────────────

class Case(CatalystDocument):
    crime_no: str
    case_no: str
    crime_registered_date: str           # ISO date string  "YYYY-MM-DD"
    brief_facts: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Denormalized embedded data (stored as JSON strings in Catalyst)
    district: Dict[str, Any] = Field(default_factory=dict)
    police_station: Dict[str, Any] = Field(default_factory=dict)
    case_category: Dict[str, Any] = Field(default_factory=dict)
    crime_type: Dict[str, Any] = Field(default_factory=dict)
    case_status: Dict[str, Any] = Field(default_factory=dict)

    # Embedded related entities
    accused_persons: List[Dict[str, Any]] = Field(default_factory=list)
    victims: List[Dict[str, Any]] = Field(default_factory=list)
    complainant: Optional[Dict[str, Any]] = None

    @model_validator(mode="before")
    @classmethod
    def _parse_json_fields(cls, values: Any) -> Any:
        """JSON strings coming back from Catalyst are already parsed by
        CatalystDB._parse(), but guard here in case raw strings slip through."""
        json_fields = (
            "district", "police_station", "case_category",
            "crime_type", "case_status", "accused_persons", "victims", "complainant",
        )
        for field in json_fields:
            val = values.get(field)
            if isinstance(val, str):
                try:
                    values[field] = json.loads(val)
                except (ValueError, TypeError):
                    pass
        return values

    # ── shims for old route code ─────────────────────────────────────────────
    @property
    def CaseMasterID(self) -> int:
        try:
            return int(self.ROWID or 0)
        except (ValueError, TypeError):
            return 0

    @property
    def CrimeNo(self) -> str:
        return self.crime_no

    @property
    def BriefFacts(self) -> Optional[str]:
        return self.brief_facts

    @property
    def CrimeRegisteredDate(self):
        from datetime import date
        try:
            return date.fromisoformat(self.crime_registered_date[:10])
        except Exception:
            return None

    # ── class methods ────────────────────────────────────────────────────────

    @classmethod
    async def get_by_id(cls, row_id: str) -> Optional["Case"]:
        db = get_catalyst_db()
        doc = await db.get_document(Collections.CASES, row_id)
        return cls(**doc) if doc else None

    @classmethod
    async def get_all(cls, limit: int = 50, offset: int = 0) -> List["Case"]:
        db = get_catalyst_db()
        docs = await db.query_documents(
            Collections.CASES, max_rows=min(limit + offset, 500)
        )
        return [cls(**d) for d in docs[offset: offset + limit]]

    @classmethod
    async def search(
        cls,
        crime_type: Optional[str] = None,
        district: Optional[str] = None,
        keyword: Optional[str] = None,
        limit: int = 200,
    ) -> List["Case"]:
        """Fetch up to `limit` cases then filter in-memory (ZCQL has no JOIN)."""
        db = get_catalyst_db()
        docs = await db.query_documents(Collections.CASES, max_rows=limit)
        results = []
        for d in docs:
            case = cls(**d)
            if crime_type and case.crime_type.get("name", "") != crime_type:
                continue
            if district and case.district.get("name", "") != district:
                continue
            if keyword:
                kw = keyword.lower()
                haystack = (
                    (case.crime_no or "").lower()
                    + (case.brief_facts or "").lower()
                )
                if kw not in haystack:
                    continue
            results.append(case)
        return results

    @classmethod
    async def create_document(
        cls,
        case_data: Dict[str, Any],
        accused_list: Optional[List[Dict[str, Any]]] = None,
        victims_list: Optional[List[Dict[str, Any]]] = None,
    ) -> "Case":
        db = get_catalyst_db()
        document = {
            "crime_no": case_data["crime_no"],
            "case_no": case_data["case_no"],
            "crime_registered_date": case_data["crime_registered_date"],
            "brief_facts": case_data.get("brief_facts"),
            "latitude": case_data.get("latitude"),
            "longitude": case_data.get("longitude"),
            "district": case_data.get("district", {}),
            "police_station": case_data.get("police_station", {}),
            "case_category": case_data.get("case_category", {}),
            "crime_type": case_data.get("crime_type", {}),
            "case_status": case_data.get("case_status", {}),
            "accused_persons": accused_list or [],
            "victims": victims_list or [],
            "complainant": case_data.get("complainant"),
        }
        result = await db.insert_document(Collections.CASES, document)
        return cls(**result)


# ── Lookup ───────────────────────────────────────────────────────────────────

class Lookup(CatalystDocument):
    """
    Single collection for all reference / lookup data.
    Discriminated by `type`: 'district' | 'crime_head' | 'case_status' | ...
    """
    type: str
    code: str
    name: str
    parent_id: Optional[str] = None
    active: bool = True

    @classmethod
    async def get_by_type(cls, lookup_type: str) -> List["Lookup"]:
        db = get_catalyst_db()
        rows = await db.query_documents(
            Collections.LOOKUPS,
            query=f"type = '{lookup_type}'",
        )
        return [cls(**r) for r in rows if r.get("active", True)]

    @classmethod
    async def get_map(cls, lookup_type: str) -> Dict[str, str]:
        """Return {code: name} mapping — handy for denormalization."""
        items = await cls.get_by_type(lookup_type)
        return {item.code: item.name for item in items}


# ── ChatSession ───────────────────────────────────────────────────────────────

class ChatSession(CatalystDocument):
    user_id: str
    query: str
    response: Optional[str] = None
    language: str = "en"
    time_stamp: Optional[str] = None   # column is named time_stamp in Catalyst

    # shim so old route code sees .id
    @property
    def id(self) -> int:
        try:
            return int(self.ROWID or 0)
        except (ValueError, TypeError):
            return 0

    @property
    def timestamp(self) -> Optional[str]:
        """Alias so existing code using .timestamp still works."""
        return self.time_stamp

    @classmethod
    async def get_by_user(cls, user_id: str, limit: int = 50) -> List["ChatSession"]:
        db = get_catalyst_db()
        rows = await db.query_documents(
            Collections.CHATS,
            query=f"user_id = '{user_id}'",
            max_rows=limit,
        )
        return [cls(**r) for r in rows]

    @classmethod
    async def create(
        cls,
        user_id: str,
        query: str,
        response: Optional[str] = None,
        language: str = "en",
    ) -> "ChatSession":
        from datetime import datetime, timezone
        db = get_catalyst_db()
        result = await db.insert_document(
            Collections.CHATS,
            {
                "user_id": user_id,
                "query": query,
                "response": response,
                "language": language,
                "time_stamp": datetime.now(timezone.utc).isoformat(),
            },
        )
        return cls(**result)


# ── Alert ─────────────────────────────────────────────────────────────────────

class Alert(CatalystDocument):
    title: str
    severity: str           # 'low' | 'medium' | 'high' | 'critical'
    case_id: Optional[str] = None
    is_read: bool = False

    # shim
    @property
    def id(self) -> int:
        try:
            return int(self.ROWID or 0)
        except (ValueError, TypeError):
            return 0

    @classmethod
    async def get_all(
        cls,
        severity: Optional[str] = None,
        unread_only: bool = False,
        limit: int = 100,
    ) -> List["Alert"]:
        db = get_catalyst_db()
        parts: List[str] = []
        if severity:
            parts.append(f"severity = '{severity}'")
        if unread_only:
            parts.append("is_read = false")
        query = " AND ".join(parts) if parts else None
        rows = await db.query_documents(Collections.ALERTS, query=query, max_rows=limit)
        return [cls(**r) for r in rows]

    @classmethod
    async def create(
        cls,
        title: str,
        severity: str,
        case_id: Optional[str] = None,
    ) -> "Alert":
        db = get_catalyst_db()
        result = await db.insert_document(
            Collections.ALERTS,
            {"title": title, "severity": severity, "case_id": case_id, "is_read": False},
        )
        return cls(**result)

    async def mark_read(self) -> None:
        if not self.ROWID:
            return
        db = get_catalyst_db()
        await db.update_document(Collections.ALERTS, self.ROWID, {"is_read": True})
        self.is_read = True


# ── AuditLog ─────────────────────────────────────────────────────────────────

class AuditLog(CatalystDocument):
    user_id: str
    action_type: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    time_stamp: Optional[str] = None   # column is named time_stamp in Catalyst

    # shim
    @property
    def id(self) -> int:
        try:
            return int(self.ROWID or 0)
        except (ValueError, TypeError):
            return 0

    @property
    def timestamp(self) -> Optional[str]:
        """Alias so existing code using .timestamp still works."""
        return self.time_stamp

    @classmethod
    async def create(
        cls,
        user_id: str,
        action_type: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> "AuditLog":
        from datetime import datetime, timezone
        db = get_catalyst_db()
        result = await db.insert_document(
            Collections.AUDIT_LOGS,
            {
                "user_id": user_id,
                "action_type": action_type,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "ip_address": ip_address,
                "time_stamp": datetime.now(timezone.utc).isoformat(),
            },
        )
        return cls(**result)

    @classmethod
    async def get_all(
        cls,
        user_id: Optional[str] = None,
        action_type: Optional[str] = None,
        limit: int = 100,
    ) -> List["AuditLog"]:
        db = get_catalyst_db()
        parts: List[str] = []
        if user_id:
            parts.append(f"user_id = '{user_id}'")
        if action_type:
            parts.append(f"action_type = '{action_type}'")
        query = " AND ".join(parts) if parts else None
        rows = await db.query_documents(Collections.AUDIT_LOGS, query=query, max_rows=limit)
        return [cls(**r) for r in rows]
