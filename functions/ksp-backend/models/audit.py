"""
Audit model shim — NoSQL edition.

The real AuditLog model now lives in nosql_models.py.
This file re-exports it so existing imports like
  `from models.audit import AuditLog`
continue to work without changes.
"""

from models.nosql_models import AuditLog  # noqa: F401

__all__ = ["AuditLog"]
