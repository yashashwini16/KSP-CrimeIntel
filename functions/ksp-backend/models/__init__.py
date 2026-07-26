"""
Models package — NoSQL edition.
Re-exports only the NoSQL models. All SQLAlchemy models removed.
"""

from .database import Collections, get_catalyst_db, get_db
from .nosql_models import AuditLog, Alert, Case, ChatSession, Lookup, User

__all__ = [
    "Collections",
    "get_catalyst_db",
    "get_db",
    "AuditLog",
    "Alert",
    "Case",
    "ChatSession",
    "Lookup",
    "User",
]
