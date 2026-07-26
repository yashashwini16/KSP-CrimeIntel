"""
Helper utilities — NoSQL edition.
log_audit now writes to the Catalyst 'audit_logs' collection.
"""

import logging
from typing import Any


async def log_audit(
    db: Any,
    user_id: str,
    action_type: str,
    resource_type: str | None,
    resource_id: str | None,
    ip_address: str | None,
) -> None:
    try:
        from models.nosql_models import AuditLog
        await AuditLog.create(
            user_id=str(user_id),
            action_type=action_type,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            ip_address=ip_address,
        )
    except Exception as exc:  # noqa: BLE001
        logging.error("Failed to write audit log: %s", exc, exc_info=True)
