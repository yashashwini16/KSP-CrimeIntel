"""
Chat route — NoSQL edition.
ChatSession stored in Catalyst 'chat_sessions' collection.
"""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from models.database import get_db
from models.nosql_models import ChatSession
from services.ai_service import AIService
from utils.catalyst_auth import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/stream")
async def chat_stream(
    query: Annotated[str, Query(min_length=1)],
    db: Annotated[object, Depends(get_db)],
    current_user: Annotated[Any, Depends(get_current_user)],
    language: Annotated[str, Query(pattern="^(en|kn)$")] = "en",
) -> StreamingResponse:
    full_response: list[str] = []

    async def event_stream():
        async for token in AIService().chat_stream(
            query=query,
            language=language,
            db=db,
            user_id=str(current_user.id),
        ):
            full_response.append(token)
            yield f"data: {token}\n\n"

        # Persist completed session to Catalyst
        try:
            await ChatSession.create(
                user_id=str(current_user.id),
                query=query,
                response="".join(full_response),
                language=language,
            )
        except Exception:  # noqa: BLE001
            pass  # non-fatal

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/sessions")
async def list_chat_sessions(
    db: Annotated[object, Depends(get_db)],
    current_user: Annotated[Any, Depends(get_current_user)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[dict[str, Any]]:
    sessions = await ChatSession.get_by_user(str(current_user.id), limit=limit)
    return [_session_to_dict(s) for s in sessions]


@router.get("/sessions/{session_id}")
async def get_chat_session(
    session_id: str,
    db: Annotated[object, Depends(get_db)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> dict[str, Any]:
    from models.database import get_catalyst_db, Collections
    catalyst_db = get_catalyst_db()
    doc = await catalyst_db.get_document(Collections.CHATS, session_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Chat session not found")

    session = ChatSession(**doc)
    # Ensure the session belongs to current user
    if session.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Chat session not found")

    return _session_to_dict(session)


def _session_to_dict(session: ChatSession) -> dict[str, Any]:
    return {
        "id": session.ROWID,
        "user_id": session.user_id,
        "query": session.query,
        "response": session.response,
        "language": session.language,
        "timestamp": session.time_stamp,  # return as 'timestamp' to frontend
    }
