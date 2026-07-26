"""Network / criminal link graph endpoint — NoSQL edition."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends

from models.database import get_db
from schemas.network import GraphResponse
from services.graph_service import GraphService
from utils.catalyst_auth import get_current_user

router = APIRouter(prefix="/api/network", tags=["network"])


@router.get("/graph", response_model=GraphResponse)
async def get_network_graph(
    db: Annotated[object, Depends(get_db)],
    _current_user: Annotated[Any, Depends(get_current_user)],
) -> GraphResponse:
    service = GraphService()
    graph = await service.build_graph(db)
    communities = service.detect_communities(graph)
    return service.to_dict(graph, communities)
