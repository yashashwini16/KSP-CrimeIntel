"""
Auth route — NoSQL edition.
User lookups now go through nosql_models.User instead of SQLAlchemy.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from schemas.auth import LoginRequest, LoginResponse
from utils.catalyst_auth import CatalystAuthClient, extract_bearer_token
from utils.helpers import log_audit
from models.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])
_bearer = HTTPBearer(auto_error=False)


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest) -> LoginResponse:
    session = await CatalystAuthClient().login(payload.username, payload.password)
    return LoginResponse(
        access_token=session.access_token,
        user_id=session.user_id,
        username=session.username,
        role=session.role,
        expires_in=session.expires_in,
    )


@router.post("/logout")
async def logout(
    request: Request,
    db: Annotated[object, Depends(get_db)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> dict[str, str]:
    token = None
    user_id = "0"
    try:
        token = extract_bearer_token(credentials)
        user = await CatalystAuthClient().validate_token(token)
        user_id = str(user.id)
    except Exception:  # noqa: BLE001
        pass

    await CatalystAuthClient().logout(token)
    await log_audit(
        db,
        user_id=user_id,
        action_type="logout",
        resource_type="system",
        resource_id=None,
        ip_address=request.client.host if request.client else None,
    )
    return {"status": "ok"}
