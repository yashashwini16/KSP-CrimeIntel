import os
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from models.nosql_models import User


DEMO_USERNAME = os.environ.get("DEMO_USERNAME", "admin_ksp")
DEMO_PASSWORD = os.environ.get("DEMO_PASSWORD", "demo_password")
_LOCAL_SESSIONS: dict[str, dict[str, Any]] = {}
_bearer = HTTPBearer(auto_error=False)


@dataclass
class CatalystSession:
    access_token: str
    user_id: int
    username: str
    role: str
    expires_in: int | None = None


class CatalystAuthClient:
    """Small Catalyst Auth SDK boundary.

    In AppSail, set CATALYST_AUTH_ENDPOINT so credentials/tokens are delegated to
    Catalyst Authentication. In local tests/dev, a single demo credential pair is
    accepted and all other credentials/tokens are rejected.
    """

    def __init__(self, endpoint: str | None = None, timeout: float = 20.0) -> None:
        self.endpoint = endpoint or os.environ.get("CATALYST_AUTH_ENDPOINT")
        self.timeout = timeout

    async def login(self, username: str, password: str) -> CatalystSession:
        if self.endpoint:
            return await self._remote_login(username, password)
        if username != DEMO_USERNAME or password != DEMO_PASSWORD:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        token = f"local-{secrets.token_urlsafe(24)}"
        expires_in = 3600
        _LOCAL_SESSIONS[token] = {
            "user_id": 1,
            "username": username,
            "role": "admin",
            "expires_at": datetime.now(timezone.utc) + timedelta(seconds=expires_in),
        }
        return CatalystSession(
            access_token=token,
            user_id=1,
            username=username,
            role="admin",
            expires_in=expires_in,
        )

    async def validate_token(self, token: str) -> User:
        if self.endpoint:
            data = await self._remote_validate(token)
            return User(
                ROWID=str(data.get("user_id") or data.get("id") or "0"),
                username=str(data.get("username") or data.get("email") or "catalyst-user"),
                password_hash="",
                role=str(data.get("role") or "analyst"),
            )

        session = _LOCAL_SESSIONS.get(token)
        if not session or session["expires_at"] <= datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
        return User(
            ROWID=str(session["user_id"]),
            username=str(session["username"]),
            password_hash="",
            role=str(session["role"]),
        )

    async def logout(self, token: str | None) -> None:
        if not token:
            return
        if self.endpoint:
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    await client.post(
                        f"{self.endpoint.rstrip('/')}/logout",
                        headers={"Authorization": f"Bearer {token}"},
                    )
            except Exception:  # noqa: BLE001
                return
        _LOCAL_SESSIONS.pop(token, None)

    async def _remote_login(self, username: str, password: str) -> CatalystSession:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.endpoint.rstrip('/')}/login",
                    json={"username": username, "password": password},
                )
                if response.status_code in {status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN}:
                    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
                response.raise_for_status()
                data = response.json()
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Catalyst Auth unavailable") from exc

        token = data.get("access_token") or data.get("token") or data.get("session_token")
        if not token:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Catalyst Auth returned no token")
        return CatalystSession(
            access_token=str(token),
            user_id=int(data.get("user_id") or data.get("id") or 0),
            username=str(data.get("username") or username),
            role=str(data.get("role") or "analyst"),
            expires_in=data.get("expires_in"),
        )

    async def _remote_validate(self, token: str) -> dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.endpoint.rstrip('/')}/validate",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if response.status_code in {status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN}:
                    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
                response.raise_for_status()
                data = response.json()
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc
        return data if isinstance(data, dict) else {}


def extract_bearer_token(
    credentials: HTTPAuthorizationCredentials | None,
) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return credentials.credentials


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> User:
    token = extract_bearer_token(credentials)
    return await CatalystAuthClient().validate_token(token)
