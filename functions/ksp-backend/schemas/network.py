from pydantic import BaseModel, ConfigDict, Field


class NodeSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    label: str
    type: str = "accused"
    community_id: int | None = None
    risk_score: int | None = Field(default=None, ge=0, le=100)
    metadata: dict[str, object] = Field(default_factory=dict)


class EdgeSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source: str
    target: str
    link_type: str
    weight: float = 1.0
    directed: bool = True
    metadata: dict[str, object] = Field(default_factory=dict)


class GraphResponse(BaseModel):
    nodes: list[NodeSchema]
    edges: list[EdgeSchema]
