from datetime import date, datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int


class AlertSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    severity: str
    fir_id: int | None = None
    is_read: bool
    created_at: datetime


class AuditLogSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    action_type: str
    resource_type: str | None = None
    resource_id: str | None = None
    timestamp: datetime
    ip_address: str | None = None


class ForecastPoint(BaseModel):
    date: date
    district: str
    crime_type: str
    count: int
    predicted: bool = False


class ForecastResponse(BaseModel):
    historical: list[ForecastPoint]
    forecast: list[ForecastPoint]
    summary: str
